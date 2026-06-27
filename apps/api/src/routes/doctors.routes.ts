import { Router } from "express";
import { z } from "zod";
import { asyncHandler, notFound } from "../http/errors";
import { store } from "../store/store";
import { requireAuth, requireRole } from "../auth/rbac";

export const doctorsRouter = Router();

const doctorSpecialties = [
  "PLASTIC_SURGERY",
  "BURN_CARE",
  "GENERAL_SURGERY",
  "ORTHOPAEDIC_SURGERY",
  "VASCULAR_SURGERY",
  "DERMATOLOGY",
  "WOUND_CARE_NURSING",
  "OTHER"
] as const;

// GET /doctors?specialty&facilityId&stateId&zoneId&q  (public read)
doctorsRouter.get(
  "/doctors",
  asyncHandler(async (req, res) => {
    const { specialty, facilityId, stateId, zoneId, q } = req.query as Record<
      string,
      string | undefined
    >;
    const data = await store.listDoctors({ specialty, facilityId, stateId, zoneId, q });
    res.json({ data, meta: { total: data.length } });
  })
);

// GET /doctors/:id  (public read)
doctorsRouter.get(
  "/doctors/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const doctor = await store.getDoctorById(id);
    if (!doctor) throw notFound("Doctor not found");
    res.json({ data: doctor });
  })
);

/**
 * Doctor import pipeline. Enforces the platform's no-fabrication policy for the
 * Specialist Doctors Directory: every record MUST carry verifiable provenance
 * (a `source` — register name or published URL). Contact fields (phone/email/
 * website) are optional and only persisted when supplied by the verified
 * source — individual numbers are never invented. When a `facilityId` is
 * supplied it must resolve to an existing facility; when a `stateId` is
 * supplied it must resolve to a real state, and the zone is derived from it.
 */
const importItemSchema = z.object({
  fullName: z.string().min(3),
  title: z.string().optional(),
  specialty: z.enum(doctorSpecialties),
  facilityId: z.string().optional(),
  hospitalName: z.string().optional(),
  stateId: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  source: z.string().min(3),
  verifiedAt: z.string().datetime().optional()
});

const importSchema = z.object({ items: z.array(z.unknown()).min(1) });

doctorsRouter.post(
  "/doctors/import",
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

      let zoneId: string | undefined;
      if (item.stateId) {
        const state = stateById.get(item.stateId);
        if (!state) {
          rejected.push({ index, reason: `Unknown stateId "${item.stateId}"` });
          continue;
        }
        zoneId = state.zoneId;
      }

      if (item.facilityId) {
        const facility = await store.getFacilityById(item.facilityId);
        if (!facility) {
          rejected.push({ index, reason: `Unknown facilityId "${item.facilityId}"` });
          continue;
        }
        zoneId = zoneId ?? facility.zoneId;
      }

      if (await store.hasDoctor(item.fullName, item.facilityId)) {
        rejected.push({ index, reason: "Duplicate: doctor already exists for this facility" });
        continue;
      }

      const created = await store.addDoctor({
        fullName: item.fullName,
        title: item.title,
        specialty: item.specialty,
        facilityId: item.facilityId,
        hospitalName: item.hospitalName,
        zoneId,
        stateId: item.stateId,
        city: item.city,
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
