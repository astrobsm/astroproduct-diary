import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { asyncHandler, badRequest } from "../http/errors";
import { requireAuth, requireRole } from "../auth/rbac";
import { config, storageEnabled } from "../config";

/**
 * Image upload endpoint — durable Supabase Storage backup.
 *
 * The web app compresses images client-side and POSTs them here as a data URL.
 * When Supabase Storage is configured (SUPABASE_SERVICE_ROLE_KEY present), the
 * image is persisted as a file in a public bucket and a hosted URL is returned.
 * When it is not configured, the original data URL is echoed back so the client
 * still has a working inline copy (no functionality is lost).
 */
export const uploadsRouter = Router();

const UPLOAD_ROLES = ["ADMIN", "PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "SALES_REP", "TRAINER"];

const uploadSchema = z.object({
  dataUrl: z.string().min(1),
  kind: z.enum(["product", "seminar", "misc"]).default("misc")
});

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:(image\/[a-z+.-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const [, mime, b64] = match;
  return { mime: mime.toLowerCase(), buffer: Buffer.from(b64, "base64") };
}

const jsonHeaders = () => ({
  Authorization: `Bearer ${config.supabase.serviceKey}`,
  apikey: config.supabase.serviceKey as string,
  "Content-Type": "application/json"
});

/** Create the public bucket if it does not already exist (idempotent). */
async function ensureBucket(): Promise<void> {
  const { url, bucket } = config.supabase;
  const check = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers: jsonHeaders() });
  if (check.ok) return;
  await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 5_242_880,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"]
    })
  });
}

async function uploadToStorage(buffer: Buffer, mime: string, path: string): Promise<string> {
  const { url, bucket } = config.supabase;
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.supabase.serviceKey}`,
      apikey: config.supabase.serviceKey as string,
      "Content-Type": mime,
      "x-upsert": "true"
    },
    body: new Uint8Array(buffer)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Storage upload failed (${res.status}): ${text}`);
  }
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

uploadsRouter.post(
  "/",
  requireAuth,
  requireRole(...UPLOAD_ROLES),
  asyncHandler(async (req, res) => {
    const { dataUrl, kind } = uploadSchema.parse(req.body);

    // Already a hosted URL or path — nothing to store, return as-is.
    if (!dataUrl.startsWith("data:")) {
      res.json({ data: { url: dataUrl, stored: false, reason: "not-a-data-url" } });
      return;
    }

    const parsed = parseDataUrl(dataUrl);
    if (!parsed) throw badRequest("Expected a base64 image data URL.");

    // Storage not configured — keep the inline copy as the working fallback.
    if (!storageEnabled) {
      res.json({ data: { url: dataUrl, stored: false, reason: "storage-not-configured" } });
      return;
    }

    const ext = EXT_BY_MIME[parsed.mime] ?? "jpg";
    const path = `${kind}/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    try {
      await ensureBucket();
      const url = await uploadToStorage(parsed.buffer, parsed.mime, path);
      res.json({ data: { url, stored: true } });
    } catch {
      // Never fail the user's save because the backup upload failed — fall back.
      res.json({ data: { url: dataUrl, stored: false, reason: "upload-failed" } });
    }
  })
);
