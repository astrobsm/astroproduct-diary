import { Router } from "express";
import { z } from "zod";
import { asyncHandler, notFound, unauthorized } from "../http/errors";
import { store } from "../store/store";
import { requireAuth, requireRole } from "../auth/rbac";

export const totRouter = Router();

totRouter.use(requireAuth);

const TRAINING_ROLES = ["PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "TRAINER"];

const trainerStatuses = [
  "NOMINATED",
  "IN_TRAINING",
  "CERTIFIED",
  "DECLINED",
  "SUSPENDED"
] as const;

const trainerSchema = z.object({
  fullName: z.string().min(2),
  contactId: z.string().optional(),
  userId: z.string().optional(),
  organization: z.string().optional(),
  email: z.string().email().optional(),
  specialty: z.string().optional(),
  courseId: z.string().optional()
});

totRouter.get(
  "/trainers",
  asyncHandler(async (req, res) => {
    const { status, courseId, q } = req.query as Record<string, string | undefined>;
    const data = await store.listTrainers({ status, courseId, q });
    res.json({ data, meta: { total: data.length } });
  })
);

totRouter.get(
  "/trainers/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const trainer = await store.getTrainerById(id);
    if (!trainer) throw notFound("Trainer not found");
    const assessments = await store.listAssessments(id);
    res.json({ data: { ...trainer, assessments } });
  })
);

totRouter.post(
  "/trainers",
  requireRole(...TRAINING_ROLES),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const input = trainerSchema.parse(req.body);
    const created = await store.createTrainer({
      ...input,
      status: "NOMINATED",
      createdById: req.user.sub
    });
    res.status(201).json({ data: created });
  })
);

totRouter.patch(
  "/trainers/:id",
  requireRole(...TRAINING_ROLES),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = z.object({ status: z.enum(trainerStatuses) }).parse(req.body);
    const updated = await store.updateTrainerStatus(id, status);
    if (!updated) throw notFound("Trainer not found");
    res.json({ data: updated });
  })
);

const assessmentSchema = z.object({
  competency: z.string().min(2),
  score: z.number().int().min(0).max(100),
  notes: z.string().optional()
});

totRouter.post(
  "/trainers/:id/assessments",
  requireRole(...TRAINING_ROLES),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const { id } = req.params as { id: string };
    const trainer = await store.getTrainerById(id);
    if (!trainer) throw notFound("Trainer not found");
    const input = assessmentSchema.parse(req.body);
    const created = await store.createAssessment({
      ...input,
      trainerId: id,
      assessorId: req.user.sub
    });
    res.status(201).json({ data: created });
  })
);
