import { Router } from "express";
import { z } from "zod";
import { asyncHandler, notFound, unauthorized } from "../http/errors";
import { store } from "../store/store";
import { requireAuth } from "../auth/rbac";

export const crmRouter = Router();

// All CRM endpoints require an authenticated staff member.
crmRouter.use(requireAuth);

const contactRoles = [
  "CLINICIAN",
  "NURSE",
  "PHARMACIST",
  "PROCUREMENT",
  "ADMIN",
  "DISTRIBUTOR",
  "OTHER"
] as const;

const interactionTypes = ["CALL", "VISIT", "MEETING", "EMAIL", "SEMINAR"] as const;
const followUpStatuses = ["OPEN", "DONE", "CANCELLED"] as const;

// --- Contacts ---
const contactSchema = z.object({
  fullName: z.string().min(2),
  title: z.string().optional(),
  role: z.enum(contactRoles).default("OTHER"),
  organization: z.string().optional(),
  facilityId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  consentAt: z.string().datetime().optional()
});

crmRouter.get(
  "/contacts",
  asyncHandler(async (req, res) => {
    const { facilityId, role, q } = req.query as Record<string, string | undefined>;
    const data = await store.listContacts({ facilityId, role, q });
    res.json({ data, meta: { total: data.length } });
  })
);

crmRouter.post(
  "/contacts",
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const input = contactSchema.parse(req.body);
    const created = await store.createContact({ ...input, createdById: req.user.sub });
    res.status(201).json({ data: created });
  })
);

crmRouter.get(
  "/contacts/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const contact = await store.getContactById(id);
    if (!contact) throw notFound("Contact not found");
    const interactions = await store.listInteractions(id);
    res.json({ data: { ...contact, interactions } });
  })
);

// --- Interactions ---
const interactionSchema = z.object({
  contactId: z.string().optional(),
  facilityId: z.string().optional(),
  type: z.enum(interactionTypes),
  channel: z.string().optional(),
  notes: z.string().optional(),
  occurredAt: z.string().datetime().optional()
});

crmRouter.get(
  "/interactions",
  asyncHandler(async (req, res) => {
    const { contactId } = req.query as { contactId?: string };
    const data = await store.listInteractions(contactId);
    res.json({ data, meta: { total: data.length } });
  })
);

crmRouter.post(
  "/interactions",
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const input = interactionSchema.parse(req.body);
    const created = await store.createInteraction({
      ...input,
      userId: req.user.sub,
      occurredAt: input.occurredAt ?? new Date().toISOString()
    });
    res.status(201).json({ data: created });
  })
);

// --- Follow-ups ---
const followUpSchema = z.object({
  interactionId: z.string().optional(),
  contactId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  notes: z.string().optional()
});

crmRouter.get(
  "/follow-ups",
  asyncHandler(async (req, res) => {
    const { status, contactId } = req.query as Record<string, string | undefined>;
    const data = await store.listFollowUps({ status, contactId });
    res.json({ data, meta: { total: data.length } });
  })
);

crmRouter.post(
  "/follow-ups",
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const input = followUpSchema.parse(req.body);
    const created = await store.createFollowUp({
      ...input,
      status: "OPEN",
      createdById: req.user.sub
    });
    res.status(201).json({ data: created });
  })
);

crmRouter.patch(
  "/follow-ups/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = z.object({ status: z.enum(followUpStatuses) }).parse(req.body);
    const updated = await store.updateFollowUpStatus(id, status);
    if (!updated) throw notFound("Follow-up not found");
    res.json({ data: updated });
  })
);
