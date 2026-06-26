import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../http/errors";
import { store } from "../store/store";
import { requireAuth, requireRole } from "../auth/rbac";

export const researchRouter = Router();

const evidenceLevels = [
  "Systematic review / meta-analysis",
  "Meta-analysis",
  "RCT",
  "Review",
  "Laboratory / in-vitro",
  "Clinical practice",
  "Guideline"
] as const;

// GET /research  (public read; filter by source, evidenceLevel, q)
researchRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { source, evidenceLevel, q } = req.query as Record<string, string | undefined>;
    const data = await store.listReferences({ source, evidenceLevel, q });
    res.json({ data, meta: { total: data.length } });
  })
);

/**
 * Import pipeline. Enforces the platform's no-fabrication policy:
 * every reference MUST carry verifiable provenance (a known source AND a DOI or
 * URL). Entries missing provenance or required fields are rejected, not stored.
 * Duplicates (by DOI or title) are skipped. Designed to receive normalized output
 * from connectors (PubMed, WHO, Cochrane, etc.) added in later phases.
 */
const importItemSchema = z.object({
  title: z.string().min(5),
  authors: z.string().min(2),
  journal: z.string().min(2),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  source: z.string().min(2),
  evidenceLevel: z.enum(evidenceLevels),
  doi: z.string().optional(),
  url: z.string().url().optional(),
  summary: z.string().optional()
});

const importSchema = z.object({ items: z.array(z.unknown()).min(1) });

researchRouter.post(
  "/import",
  requireAuth,
  requireRole("MEDICAL_DIRECTOR", "PRODUCT_MANAGER"),
  asyncHandler(async (req, res) => {
    const { items } = importSchema.parse(req.body);
    const accepted: string[] = [];
    const rejected: { index: number; reason: string }[] = [];

    for (let index = 0; index < items.length; index += 1) {
      const raw = items[index];
      const parsed = importItemSchema.safeParse(raw);
      if (!parsed.success) {
        rejected.push({ index, reason: parsed.error.issues.map((i) => i.message).join("; ") });
        continue;
      }
      const item = parsed.data;
      // Provenance requirement: must be verifiable.
      if (!item.doi && !item.url) {
        rejected.push({ index, reason: "Missing provenance: a DOI or URL is required" });
        continue;
      }
      if (await store.hasReference(item.doi, item.title)) {
        rejected.push({ index, reason: "Duplicate: reference already exists" });
        continue;
      }
      const created = await store.addReference(item);
      accepted.push(created.id);
    }

    res.status(201).json({
      data: {
        rows: items.length,
        accepted: accepted.length,
        rejected: rejected.length,
        acceptedIds: accepted,
        rejections: rejected
      }
    });
  })
);
