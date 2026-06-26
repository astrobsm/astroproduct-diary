import { Router } from "express";
import { z } from "zod";
import { asyncHandler, notFound } from "../http/errors";
import { store } from "../store/store";
import { requireAuth, requireRole } from "../auth/rbac";

export const hospitalsRouter = Router();

const facilityTypes = [
  "TEACHING_HOSPITAL",
  "FEDERAL_MEDICAL_CENTRE",
  "GENERAL_HOSPITAL",
  "SPECIALIST_HOSPITAL",
  "PRIMARY_HEALTH_CENTRE",
  "PRIVATE_HOSPITAL",
  "CLINIC",
  "PHARMACY",
  "OTHER"
] as const;

// GET /geo/zones  (public reference geography)
hospitalsRouter.get(
  "/geo/zones",
  asyncHandler(async (_req, res) => {
    const data = await store.listZones();
    res.json({ data, meta: { total: data.length } });
  })
);

// GET /geo/states?zoneId=  (public reference geography)
hospitalsRouter.get(
  "/geo/states",
  asyncHandler(async (req, res) => {
    const { zoneId } = req.query as { zoneId?: string };
    const data = await store.listStates(zoneId);
    res.json({ data, meta: { total: data.length } });
  })
);

// GET /facilities?zoneId&stateId&type&q  (public read)
hospitalsRouter.get(
  "/facilities",
  asyncHandler(async (req, res) => {
    const { zoneId, stateId, type, q } = req.query as Record<string, string | undefined>;
    const data = await store.listFacilities({ zoneId, stateId, type, q });
    res.json({ data, meta: { total: data.length } });
  })
);

// GET /facilities/:id  (public read)
hospitalsRouter.get(
  "/facilities/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const facility = await store.getFacilityById(id);
    if (!facility) throw notFound("Facility not found");
    res.json({ data: facility });
  })
);

/**
 * Facility import pipeline. Enforces the platform's no-fabrication policy for
 * the National Hospital Database: every record MUST carry verifiable provenance
 * (a `source` — register name or URL) and resolve to a real state/zone. Records
 * missing provenance, naming an unknown state, or duplicating an existing entry
 * are rejected, never stored. Contact fields (phone/email/website) are optional
 * and only persisted when supplied by the verified source.
 */
const importItemSchema = z.object({
  name: z.string().min(3),
  type: z.enum(facilityTypes),
  stateId: z.string().min(2),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  source: z.string().min(3),
  verifiedAt: z.string().datetime().optional()
});

const importSchema = z.object({ items: z.array(z.unknown()).min(1) });

hospitalsRouter.post(
  "/facilities/import",
  requireAuth,
  requireRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR"),
  asyncHandler(async (req, res) => {
    const { items } = importSchema.parse(req.body);
    const states = await store.listStates();
    const stateById = new Map(states.map((s) => [s.id, s]));

    const accepted: string[] = [];
    const rejected: { index: number; reason: string }[] = [];

    for (let index = 0; index < items.length; index += 1) {
      const parsed = importItemSchema.safeParse(items[index]);
      if (!parsed.success) {
        rejected.push({ index, reason: parsed.error.issues.map((i) => i.message).join("; ") });
        continue;
      }
      const item = parsed.data;
      const state = stateById.get(item.stateId);
      if (!state) {
        rejected.push({ index, reason: `Unknown stateId "${item.stateId}"` });
        continue;
      }
      if (await store.hasFacility(item.name, item.stateId)) {
        rejected.push({ index, reason: "Duplicate: facility already exists in this state" });
        continue;
      }
      const created = await store.addFacility({
        name: item.name,
        type: item.type,
        zoneId: state.zoneId,
        stateId: item.stateId,
        city: item.city,
        address: item.address,
        phone: item.phone,
        email: item.email,
        website: item.website,
        source: item.source,
        verifiedAt: item.verifiedAt
      });
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
