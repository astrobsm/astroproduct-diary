import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { asyncHandler, badRequest, notFound, unauthorized } from "../http/errors";
import { store } from "../store/store";
import { requireAuth, requireRole } from "../auth/rbac";
import type { Course, CourseModule, Quiz } from "../domain/types";

export const lmsRouter = Router();

// --- Validation schemas ---
const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  contentType: z.enum(["TEXT", "VIDEO", "PDF"]).default("TEXT"),
  body: z.string().optional(),
  mediaUrl: z.string().optional(),
  durationMins: z.number().int().nonnegative().optional()
});

const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().optional(),
  lessons: z.array(lessonSchema).default([])
});

const questionSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().min(1),
  type: z.enum(["SINGLE", "MULTI", "TRUE_FALSE"]).default("SINGLE"),
  options: z.array(z.string().min(1)).min(2),
  correct: z.array(z.number().int().nonnegative()).min(1),
  explanation: z.string().optional()
});

const quizSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  passScore: z.number().int().min(0).max(100).default(70),
  questions: z.array(questionSchema).default([])
});

const courseSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers and hyphens"),
  title: z.string().min(2),
  description: z.string().default(""),
  audience: z.enum([
    "EXECUTIVE",
    "MARKETING",
    "CUSTOMER_CARE",
    "SALES",
    "DISTRIBUTOR",
    "CLINICAL",
    "TOT"
  ]),
  level: z.enum(["FOUNDATION", "INTERMEDIATE", "ADVANCED"]).default("FOUNDATION"),
  coverImage: z.string().optional(),
  accent: z.string().optional(),
  durationMins: z.number().int().nonnegative().default(0),
  published: z.boolean().default(false),
  modules: z.array(moduleSchema).default([]),
  quiz: quizSchema.optional()
});

const attemptSchema = z.object({
  answers: z
    .array(z.object({ questionId: z.string().min(1), selected: z.array(z.number().int()).default([]) }))
    .default([])
});

/** Assign stable ids to modules/lessons that arrive without one. */
function normalizeModules(modules: z.infer<typeof moduleSchema>[]): CourseModule[] {
  return modules.map((m) => ({
    ...m,
    id: m.id ?? `mod-${randomUUID()}`,
    lessons: m.lessons.map((l) => ({ ...l, id: l.id ?? `les-${randomUUID()}` }))
  }));
}

/** Assign stable ids to a quiz and its questions when missing. */
function normalizeQuiz(quiz: z.infer<typeof quizSchema>): Quiz {
  return {
    ...quiz,
    id: quiz.id ?? `quiz-${randomUUID()}`,
    questions: quiz.questions.map((q) => ({ ...q, id: q.id ?? `q-${randomUUID()}` }))
  };
}

/** Strip correct answers/explanations from a quiz before sending to learners. */
function publicQuiz(quiz?: Quiz) {
  if (!quiz) return undefined;
  return {
    id: quiz.id,
    title: quiz.title,
    passScore: quiz.passScore,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      options: q.options
    }))
  };
}

/** Public-facing course view: quiz answers removed. */
function publicCourse(course: Course) {
  return { ...course, quiz: publicQuiz(course.quiz) };
}

const arraysEqualAsSets = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);

// GET /courses  (public; only published unless privileged)
lmsRouter.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const { audience, level, q } = req.query as Record<string, string | undefined>;
    const courses = await store.listCourses({ audience, level, published: true, q });
    const data = courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      audience: c.audience,
      level: c.level,
      coverImage: c.coverImage,
      accent: c.accent,
      durationMins: c.durationMins,
      moduleCount: c.modules.length,
      lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
      hasQuiz: Boolean(c.quiz)
    }));
    res.json({ data, meta: { total: data.length } });
  })
);

// GET /courses/:slug  (public; strips quiz answers)
lmsRouter.get(
  "/courses/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = req.params as { slug: string };
    const course = await store.getCourseBySlug(slug);
    if (!course || !course.published) throw notFound("Course not found");
    res.json({ data: publicCourse(course) });
  })
);

// POST /courses  (PRODUCT_MANAGER / MEDICAL_DIRECTOR)
lmsRouter.post(
  "/courses",
  requireAuth,
  requireRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR"),
  asyncHandler(async (req, res) => {
    const input = courseSchema.parse(req.body);
    if (await store.getCourseBySlug(input.slug)) {
      throw badRequest(`A course with slug "${input.slug}" already exists`);
    }
    const created = await store.createCourse({
      ...input,
      modules: normalizeModules(input.modules),
      quiz: input.quiz ? normalizeQuiz(input.quiz) : undefined
    });
    res.status(201).json({ data: created });
  })
);

// PUT /courses/:id  (PRODUCT_MANAGER / MEDICAL_DIRECTOR)
lmsRouter.put(
  "/courses/:id",
  requireAuth,
  requireRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const existing = await store.getCourseById(id);
    if (!existing) throw notFound("Course not found");
    const patch = courseSchema.partial().parse(req.body);
    if (patch.slug && patch.slug !== existing.slug && (await store.getCourseBySlug(patch.slug))) {
      throw badRequest(`A course with slug "${patch.slug}" already exists`);
    }
    const { modules: patchModules, quiz: patchQuiz, ...rest } = patch;
    const updated = await store.updateCourse(id, {
      ...rest,
      ...(patchModules ? { modules: normalizeModules(patchModules) } : {}),
      ...(patchQuiz ? { quiz: normalizeQuiz(patchQuiz) } : {})
    });
    res.json({ data: updated });
  })
);

// DELETE /courses/:id  (PRODUCT_MANAGER / MEDICAL_DIRECTOR)
lmsRouter.delete(
  "/courses/:id",
  requireAuth,
  requireRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const ok = await store.deleteCourse(id);
    if (!ok) throw notFound("Course not found");
    res.status(204).send();
  })
);

// POST /enrollments  (any authenticated learner)
lmsRouter.post(
  "/enrollments",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const { courseId } = z.object({ courseId: z.string().min(1) }).parse(req.body);
    const course = await store.getCourseById(courseId);
    if (!course || !course.published) throw notFound("Course not found");
    const enrollment = await store.enroll(req.user.sub, courseId);
    res.status(201).json({ data: enrollment });
  })
);

// GET /enrollments/me  (current learner's enrollments)
lmsRouter.get(
  "/enrollments/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const data = await store.listEnrollments(req.user.sub);
    res.json({ data, meta: { total: data.length } });
  })
);

// POST /quizzes/:id/attempts  (grade a quiz, issue certificate on pass)
lmsRouter.post(
  "/quizzes/:id/attempts",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const { id } = req.params as { id: string };
    const { answers } = attemptSchema.parse(req.body);

    const location = await store.findQuizById(id);
    if (!location) throw notFound("Quiz not found");
    const { quiz, courseId } = location;

    const answerMap = new Map(answers.map((a) => [a.questionId, a.selected]));
    const results = quiz.questions.map((question) => {
      const selected = answerMap.get(question.id) ?? [];
      const correct = arraysEqualAsSets(selected, question.correct);
      return {
        questionId: question.id,
        correct,
        correctAnswer: question.correct,
        explanation: question.explanation
      };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const total = quiz.questions.length || 1;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= quiz.passScore;

    await store.recordAttempt({ userId: req.user.sub, quizId: quiz.id, courseId, score, passed });

    let certificate = null;
    if (passed) {
      await store.enroll(req.user.sub, courseId);
      await store.completeCourse(req.user.sub, courseId);
      const course = await store.getCourseById(courseId);
      if (course) certificate = await store.issueCertificate(req.user.sub, course);
    }

    res.status(201).json({
      data: { score, passed, passScore: quiz.passScore, results, certificate }
    });
  })
);

// GET /certificates/me  (current learner's certificates)
lmsRouter.get(
  "/certificates/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized();
    const data = await store.listCertificates(req.user.sub);
    res.json({ data, meta: { total: data.length } });
  })
);
