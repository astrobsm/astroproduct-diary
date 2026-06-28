import { Router } from "express";
import { z } from "zod";
import { asyncHandler, badRequest, notFound, unauthorized } from "../http/errors";
import { store } from "../store/store";
import { requireAuth, requireRole } from "../auth/rbac";

export const campaignsRouter = Router();

campaignsRouter.use(requireAuth);

const MARKETING_ROLES = ["PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "SALES_REP", "TRAINER"];

const channels = ["EMAIL", "SMS", "SOCIAL", "FIELD", "RADIO", "EVENT"] as const;
const campaignStatuses = ["DRAFT", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
const seminarStatuses = ["PLANNED", "OPEN", "FULL", "COMPLETED", "CANCELLED"] as const;
const registrationStatuses = ["REGISTERED", "WAITLISTED", "ATTENDED", "CANCELLED"] as const;

// --- Campaigns ---
const campaignSchema = z.object({
  name: z.string().min(3),
  objective: z.string().min(3),
  channel: z.enum(channels),
  audience: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  productSlugs: z.array(z.string()).optional()
});

campaignsRouter.get(
  "/campaigns",
  asyncHandler(async (req, res) => {
    const { status, channel, q } = req.query as Record<string, string | undefined>;
    const data = await store.listCampaigns({ status, channel, q });
    res.json({ data, meta: { total: data.length } });
  })
);

campaignsRouter.post(
  "/campaigns",
  requireRole(...MARKETING_ROLES),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const input = campaignSchema.parse(req.body);
    const created = await store.createCampaign({
      ...input,
      status: "DRAFT",
      productSlugs: input.productSlugs ?? [],
      createdById: req.user.sub
    });
    res.status(201).json({ data: created });
  })
);

campaignsRouter.patch(
  "/campaigns/:id",
  requireRole(...MARKETING_ROLES),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = z.object({ status: z.enum(campaignStatuses) }).parse(req.body);
    const updated = await store.updateCampaignStatus(id, status);
    if (!updated) throw notFound("Campaign not found");
    res.json({ data: updated });
  })
);

// --- Seminars ---
const seminarSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(3),
  campaignId: z.string().optional(),
  facilityId: z.string().optional(),
  city: z.string().optional(),
  stateId: z.string().optional(),
  venue: z.string().optional(),
  imageUrl: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional()
});

campaignsRouter.get(
  "/seminars",
  asyncHandler(async (req, res) => {
    const { status, campaignId, q, upcoming } = req.query as Record<string, string | undefined>;
    const seminars = await store.listSeminars({
      status,
      campaignId,
      q,
      upcoming: upcoming === "true"
    });
    const data = await Promise.all(
      seminars.map(async (s) => ({
        ...s,
        registered: await store.countRegistrations(s.id)
      }))
    );
    res.json({ data, meta: { total: data.length } });
  })
);

campaignsRouter.get(
  "/seminars/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const seminar = await store.getSeminarById(id);
    if (!seminar) throw notFound("Seminar not found");
    const registrations = await store.listRegistrations(id);
    res.json({ data: { ...seminar, registrations } });
  })
);

campaignsRouter.post(
  "/seminars",
  requireRole(...MARKETING_ROLES),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const input = seminarSchema.parse(req.body);
    if (input.campaignId && !(await store.getCampaignById(input.campaignId))) {
      throw badRequest("Unknown campaignId");
    }
    const created = await store.createSeminar({
      ...input,
      status: "PLANNED",
      createdById: req.user.sub
    });
    res.status(201).json({ data: created });
  })
);

campaignsRouter.patch(
  "/seminars/:id",
  requireRole(...MARKETING_ROLES),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = z.object({ status: z.enum(seminarStatuses) }).parse(req.body);
    const updated = await store.updateSeminarStatus(id, status);
    if (!updated) throw notFound("Seminar not found");
    res.json({ data: updated });
  })
);

// --- Registrations ---
const registrationSchema = z.object({
  contactId: z.string().optional(),
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  organization: z.string().optional()
});

campaignsRouter.post(
  "/seminars/:id/registrations",
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const { id } = req.params as { id: string };
    const seminar = await store.getSeminarById(id);
    if (!seminar) throw notFound("Seminar not found");
    const input = registrationSchema.parse(req.body);
    const count = await store.countRegistrations(id);
    const full = seminar.capacity != null && count >= seminar.capacity;
    const created = await store.registerForSeminar({
      ...input,
      seminarId: id,
      status: full ? "WAITLISTED" : "REGISTERED",
      createdById: req.user.sub
    });
    res.status(201).json({ data: created });
  })
);

campaignsRouter.patch(
  "/registrations/:id",
  requireRole(...MARKETING_ROLES),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = z.object({ status: z.enum(registrationStatuses) }).parse(req.body);
    const updated = await store.updateRegistrationStatus(id, status);
    if (!updated) throw notFound("Registration not found");
    res.json({ data: updated });
  })
);
