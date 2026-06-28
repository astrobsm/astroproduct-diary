import { PrismaClient } from "@prisma/client";
import type {
  Campaign,
  Certificate,
  Contact,
  Course,
  CourseModule,
  Enrollment,
  Facility,
  Doctor,
  FollowUp,
  GeoState,
  GeoZone,
  Interaction,
  Lesson,
  Locale,
  Product,
  Quiz,
  QuizAttempt,
  QuizQuestion,
  ResearchReference,
  Seminar,
  SeminarRegistration,
  Trainer,
  TrainerAssessment,
  User
} from "../domain/types";
import type {
  CampaignFilter,
  ContactFilter,
  CourseFilter,
  FacilityFilter,
  DoctorFilter,
  FollowUpFilter,
  ProductFilter,
  QuizLocation,
  ReferenceFilter,
  Repository,
  SeminarFilter,
  TrainerFilter
} from "./repository";

// Reuse a single PrismaClient across serverless invocations (Vercel cold
// starts) to avoid exhausting the database connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const COURSE_INCLUDE = {
  modules: { include: { lessons: true } },
  quizzes: { include: { questions: true } }
} as const;

interface CourseI18n {
  accent?: string;
  durationMins?: number;
}

const PRODUCT_INCLUDE = {
  ingredients: true,
  sections: true,
  faqs: true,
  refLinks: true
} as const;

interface ProductI18n {
  tagline?: string;
}

function toProduct(p: {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string | null;
  status: string;
  heroImage: string | null;
  i18n: unknown;
  ingredients: { name: string; percent: string | null; role: string | null }[];
  sections: { type: string; title: string; body: string; order: number }[];
  faqs: { question: string; answer: string; order: number }[];
  refLinks: { referenceId: string }[];
  createdAt: Date;
  updatedAt: Date;
}): Product {
  const i18n = (p.i18n ?? {}) as ProductI18n;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: i18n.tagline ?? "",
    category: p.category,
    summary: p.summary ?? "",
    status: p.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    image: p.heroImage ?? undefined,
    ingredients: p.ingredients.map((i) => ({
      name: i.name,
      percent: i.percent ?? undefined,
      role: i.role ?? ""
    })),
    sections: [...p.sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        type: s.type as Product["sections"][number]["type"],
        title: s.title,
        items: s.body ? s.body.split("\n").filter(Boolean) : []
      })),
    faqs: [...p.faqs]
      .sort((a, b) => a.order - b.order)
      .map((f) => ({ question: f.question, answer: f.answer })),
    references: p.refLinks.map((l) => l.referenceId),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  };
}

function toRef(r: {
  id: string;
  authors: string | null;
  title: string;
  journal: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  evidenceLevel: string;
  summary: string | null;
  source: { name: string } | null;
  createdAt: Date;
}): ResearchReference {
  return {
    id: r.id,
    authors: r.authors ?? "",
    title: r.title,
    journal: r.journal ?? "",
    year: r.year ?? 0,
    doi: r.doi ?? undefined,
    url: r.url ?? undefined,
    source: r.source?.name ?? "",
    evidenceLevel: r.evidenceLevel as ResearchReference["evidenceLevel"],
    summary: r.summary ?? undefined,
    createdAt: r.createdAt.toISOString()
  };
}

function toQuiz(q: {
  id: string;
  title: string;
  passScore: number;
  questions: {
    id: string;
    prompt: string;
    type: string;
    options: unknown;
    correct: unknown;
    explanation: string | null;
  }[];
}): Quiz {
  return {
    id: q.id,
    title: q.title,
    passScore: q.passScore,
    questions: q.questions.map(
      (qq): QuizQuestion => ({
        id: qq.id,
        prompt: qq.prompt,
        type: qq.type as QuizQuestion["type"],
        options: Array.isArray(qq.options) ? (qq.options as string[]) : [],
        correct: Array.isArray(qq.correct) ? (qq.correct as number[]) : [],
        explanation: qq.explanation ?? undefined
      })
    )
  };
}

function toCourse(c: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  audience: string;
  level: string;
  coverImage: string | null;
  i18n: unknown;
  published: boolean;
  createdAt: Date;
  modules: {
    id: string;
    title: string;
    order: number;
    i18n: unknown;
    lessons: {
      id: string;
      title: string;
      contentType: string;
      body: string | null;
      mediaUrl: string | null;
      order: number;
      i18n: unknown;
    }[];
  }[];
  quizzes: {
    id: string;
    title: string;
    passScore: number;
    courseId: string | null;
    questions: {
      id: string;
      prompt: string;
      type: string;
      options: unknown;
      correct: unknown;
      explanation: string | null;
    }[];
  }[];
}): Course {
  const i18n = (c.i18n ?? {}) as CourseI18n;
  const courseQuiz = c.quizzes.find((q) => q.courseId === c.id) ?? c.quizzes[0];
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description ?? "",
    audience: c.audience as Course["audience"],
    level: c.level as Course["level"],
    coverImage: c.coverImage ?? undefined,
    accent: i18n.accent,
    durationMins: i18n.durationMins ?? 0,
    published: c.published,
    modules: [...c.modules]
      .sort((a, b) => a.order - b.order)
      .map((m): CourseModule => {
        const mI18n = (m.i18n ?? {}) as { summary?: string };
        return {
          id: m.id,
          title: m.title,
          summary: mI18n.summary,
          lessons: [...m.lessons]
            .sort((a, b) => a.order - b.order)
            .map((l): Lesson => {
              const lI18n = (l.i18n ?? {}) as { durationMins?: number };
              return {
                id: l.id,
                title: l.title,
                contentType: l.contentType as Lesson["contentType"],
                body: l.body ?? undefined,
                mediaUrl: l.mediaUrl ?? undefined,
                durationMins: lI18n.durationMins
              };
            })
        };
      }),
    quiz: courseQuiz ? toQuiz(courseQuiz) : undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.createdAt.toISOString()
  };
}

function toEnrollment(e: {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progressPct: number;
  startedAt: Date;
  completedAt: Date | null;
}): Enrollment {
  return {
    id: e.id,
    userId: e.userId,
    courseId: e.courseId,
    status: e.status === "COMPLETED" ? "COMPLETED" : "ACTIVE",
    progressPct: e.progressPct,
    startedAt: e.startedAt.toISOString(),
    completedAt: e.completedAt?.toISOString()
  };
}

const ZONE_CODES: Record<string, string> = {
  "North Central": "NC",
  "North East": "NE",
  "North West": "NW",
  "South East": "SE",
  "South South": "SS",
  "South West": "SW"
};

/** Best-effort short code for a zone (schema has no dedicated column). */
function deriveZoneCode(name: string): string {
  return (
    ZONE_CODES[name] ??
    name
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
  );
}

function toFacility(f: {
  id: string;
  name: string;
  type: string;
  zoneId: string | null;
  stateId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
}): Facility {
  return {
    id: f.id,
    name: f.name,
    type: f.type as Facility["type"],
    zoneId: f.zoneId ?? "",
    stateId: f.stateId ?? "",
    address: f.address ?? undefined,
    phone: f.phone ?? undefined,
    email: f.email ?? undefined,
    website: f.website ?? undefined,
    source: f.source ?? "",
    verifiedAt: f.verifiedAt?.toISOString(),
    verificationStatus: f.verifiedAt ? "VERIFIED" : "UNVERIFIED",
    createdAt: f.createdAt.toISOString()
  };
}

function toDoctor(d: {
  id: string;
  fullName: string;
  title: string | null;
  specialty: string;
  facilityId: string | null;
  hospitalName: string | null;
  zoneId: string | null;
  stateId: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source: string;
  verifiedAt: Date | null;
  createdAt: Date;
}): Doctor {
  return {
    id: d.id,
    fullName: d.fullName,
    title: d.title ?? undefined,
    specialty: d.specialty as Doctor["specialty"],
    facilityId: d.facilityId ?? undefined,
    hospitalName: d.hospitalName ?? undefined,
    zoneId: d.zoneId ?? undefined,
    stateId: d.stateId ?? undefined,
    city: d.city ?? undefined,
    phone: d.phone ?? undefined,
    email: d.email ?? undefined,
    website: d.website ?? undefined,
    source: d.source,
    verifiedAt: d.verifiedAt?.toISOString(),
    verificationStatus: d.verifiedAt ? "VERIFIED" : "UNVERIFIED",
    createdAt: d.createdAt.toISOString()
  };
}

function toContact(c: {
  id: string;
  fullName: string;
  title: string | null;
  role: string;
  phone: string | null;
  email: string | null;
  facilityId: string | null;
  consentAt: Date | null;
  i18n: unknown;
}): Contact {
  const i18n = (c.i18n ?? {}) as { organization?: string };
  return {
    id: c.id,
    fullName: c.fullName,
    title: c.title ?? undefined,
    role: c.role as Contact["role"],
    organization: i18n.organization,
    facilityId: c.facilityId ?? undefined,
    phone: c.phone ?? undefined,
    email: c.email ?? undefined,
    consentAt: c.consentAt?.toISOString(),
    createdById: "",
    createdAt: c.consentAt?.toISOString() ?? new Date(0).toISOString()
  };
}

function toInteraction(i: {
  id: string;
  contactId: string | null;
  facilityId: string | null;
  userId: string;
  type: string;
  channel: string | null;
  notes: string | null;
  occurredAt: Date;
}): Interaction {
  return {
    id: i.id,
    contactId: i.contactId ?? undefined,
    facilityId: i.facilityId ?? undefined,
    userId: i.userId,
    type: i.type as Interaction["type"],
    channel: i.channel ?? undefined,
    notes: i.notes ?? undefined,
    occurredAt: i.occurredAt.toISOString(),
    createdAt: i.occurredAt.toISOString()
  };
}

function toFollowUp(f: {
  id: string;
  interactionId: string | null;
  contactId: string | null;
  assigneeId: string | null;
  dueAt: Date | null;
  status: string;
  notes: string | null;
}): FollowUp {
  return {
    id: f.id,
    interactionId: f.interactionId ?? undefined,
    contactId: f.contactId ?? undefined,
    assigneeId: f.assigneeId ?? undefined,
    dueAt: f.dueAt?.toISOString(),
    status: f.status as FollowUp["status"],
    notes: f.notes ?? undefined,
    createdById: "",
    createdAt: new Date(0).toISOString()
  };
}

function toCampaign(c: {
  id: string;
  name: string;
  ownerId: string | null;
  territory: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  objectives: unknown;
}): Campaign {
  const meta = (c.objectives ?? {}) as {
    objective?: string;
    channel?: string;
    productSlugs?: string[];
    createdById?: string;
    createdAt?: string;
  };
  return {
    id: c.id,
    name: c.name,
    objective: meta.objective ?? "",
    channel: (meta.channel as Campaign["channel"]) ?? "FIELD",
    status: c.status as Campaign["status"],
    audience: c.territory ?? undefined,
    startAt: c.startDate?.toISOString(),
    endAt: c.endDate?.toISOString(),
    productSlugs: meta.productSlugs ?? [],
    createdById: meta.createdById ?? c.ownerId ?? "",
    createdAt: meta.createdAt ?? new Date(0).toISOString()
  };
}

function toSeminar(s: {
  id: string;
  campaignId: string | null;
  title: string;
  facilityId: string | null;
  venue: string | null;
  imageUrl: string | null;
  scheduledAt: Date | null;
  organizerId: string | null;
  status: string;
}): Seminar {
  return {
    id: s.id,
    title: s.title,
    summary: "",
    status: s.status as Seminar["status"],
    campaignId: s.campaignId ?? undefined,
    facilityId: s.facilityId ?? undefined,
    venue: s.venue ?? undefined,
    imageUrl: s.imageUrl ?? undefined,
    startAt: (s.scheduledAt ?? new Date(0)).toISOString(),
    createdById: s.organizerId ?? "",
    createdAt: new Date(0).toISOString()
  };
}

function toRegistration(r: {
  id: string;
  seminarId: string;
  contactId: string | null;
  name: string | null;
  role: string | null;
  signedInAt: Date;
}): SeminarRegistration {
  return {
    id: r.id,
    seminarId: r.seminarId,
    contactId: r.contactId ?? undefined,
    fullName: r.name ?? "",
    organization: r.role ?? undefined,
    status: "REGISTERED",
    createdById: "",
    createdAt: r.signedInAt.toISOString()
  };
}

function toTrainer(t: {
  id: string;
  userId: string;
  status: string;
  bio: string | null;
  user?: { fullName?: string | null } | null;
}): Trainer {
  return {
    id: t.id,
    fullName: t.user?.fullName ?? "",
    userId: t.userId,
    specialty: t.bio ?? undefined,
    status: t.status as Trainer["status"],
    createdById: t.userId,
    createdAt: new Date(0).toISOString()
  };
}

function toAssessment(a: {
  id: string;
  trainerProfileId: string;
  score: number;
  assessorId: string | null;
  notes: string | null;
  createdAt: Date;
  competency?: { name?: string | null } | null;
}): TrainerAssessment {
  return {
    id: a.id,
    trainerId: a.trainerProfileId,
    competency: a.competency?.name ?? "",
    score: a.score,
    assessorId: a.assessorId ?? undefined,
    notes: a.notes ?? undefined,
    createdAt: a.createdAt.toISOString()
  };
}

/**
 * PostgreSQL-backed implementation of {@link Repository} via Prisma. Selected at
 * startup when DATABASE_URL is configured (see {@link createRepository}).
 */
export class PrismaRepository implements Repository {
  // --- Users ---
  async findUserByEmail(email: string): Promise<User | undefined> {
    const u = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });
    return u ? this.toUser(u) : undefined;
  }
  async findUserById(id: string): Promise<User | undefined> {
    const u = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } }
    });
    return u ? this.toUser(u) : undefined;
  }
  async findUserByIdentifier(identifier: string): Promise<User | undefined> {
    const value = identifier.trim();
    const u = await prisma.user.findFirst({
      where: { OR: [{ email: value }, { phone: value }] },
      include: { roles: { include: { role: true } } }
    });
    return u ? this.toUser(u) : undefined;
  }
  async createPendingUser(
    data: Omit<User, "id" | "status" | "roles"> & { requestedRoles: string[] }
  ): Promise<User> {
    const u = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        locale: data.locale,
        status: "PENDING",
        requestedRoles: data.requestedRoles
      },
      include: { roles: { include: { role: true } } }
    });
    return this.toUser(u);
  }
  async listUsers(status?: User["status"]): Promise<User[]> {
    const rows = await prisma.user.findMany({
      where: status ? { status } : undefined,
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((u) => this.toUser(u));
  }
  async approveUser(
    id: string,
    approvedById: string,
    roles?: string[]
  ): Promise<User | undefined> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return undefined;
    const grant = roles && roles.length > 0 ? roles : existing.requestedRoles;
    for (const key of grant) {
      const role = await prisma.role.upsert({
        where: { key },
        update: {},
        create: { key, name: key.replace(/_/g, " ") }
      });
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: id, roleId: role.id } },
        update: {},
        create: { userId: id, roleId: role.id }
      });
    }
    const u = await prisma.user.update({
      where: { id },
      data: { status: "ACTIVE", approvedAt: new Date(), approvedById },
      include: { roles: { include: { role: true } } }
    });
    return this.toUser(u);
  }
  async rejectUser(id: string, approvedById: string): Promise<User | undefined> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return undefined;
    const u = await prisma.user.update({
      where: { id },
      data: { status: "REJECTED", approvedAt: new Date(), approvedById },
      include: { roles: { include: { role: true } } }
    });
    return this.toUser(u);
  }
  private toUser(u: {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    phone: string | null;
    locale: string;
    status: string;
    requestedRoles: string[];
    approvedAt: Date | null;
    approvedById: string | null;
    createdAt?: Date;
    roles: { role: { key: string } }[];
  }): User {
    return {
      id: u.id,
      email: u.email,
      phone: u.phone ?? undefined,
      passwordHash: u.passwordHash,
      fullName: u.fullName,
      roles: u.roles.map((r) => r.role.key),
      locale: u.locale as Locale,
      status: u.status as User["status"],
      requestedRoles: u.requestedRoles,
      approvedAt: u.approvedAt ? u.approvedAt.toISOString() : undefined,
      approvedById: u.approvedById ?? undefined,
      createdAt: u.createdAt ? u.createdAt.toISOString() : undefined
    };
  }

  // --- Products ---
  async listProducts(filter?: ProductFilter): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: {
        category: filter?.category,
        status: filter?.status,
        ...(filter?.q
          ? {
              OR: [
                { name: { contains: filter.q, mode: "insensitive" } },
                { summary: { contains: filter.q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: PRODUCT_INCLUDE,
      orderBy: { name: "asc" }
    });
    return rows.map(toProduct);
  }
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const p = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_INCLUDE });
    return p ? toProduct(p) : undefined;
  }
  async getProductById(id: string): Promise<Product | undefined> {
    const p = await prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    return p ? toProduct(p) : undefined;
  }
  async createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        category: data.category,
        summary: data.summary,
        status: data.status,
        heroImage: data.image,
        i18n: { tagline: data.tagline },
        ingredients: { create: data.ingredients.map((i) => ({ name: i.name, percent: i.percent, role: i.role })) },
        sections: {
          create: data.sections.map((s, idx) => ({
            type: s.type,
            title: s.title,
            body: s.items.join("\n"),
            order: idx
          }))
        },
        faqs: { create: data.faqs.map((f, idx) => ({ question: f.question, answer: f.answer, order: idx })) },
        refLinks: { create: data.references.map((referenceId) => ({ referenceId })) }
      },
      include: PRODUCT_INCLUDE
    });
    return toProduct(created);
  }
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | undefined> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return undefined;

    const i18n =
      patch.tagline !== undefined ? { tagline: patch.tagline } : (existing.i18n ?? undefined);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          slug: patch.slug,
          name: patch.name,
          category: patch.category,
          summary: patch.summary,
          status: patch.status,
          heroImage: patch.image,
          i18n: i18n as object | undefined
        }
      });

      if (patch.ingredients) {
        await tx.productIngredient.deleteMany({ where: { productId: id } });
        await tx.productIngredient.createMany({
          data: patch.ingredients.map((i) => ({ productId: id, name: i.name, percent: i.percent, role: i.role }))
        });
      }
      if (patch.sections) {
        await tx.productSection.deleteMany({ where: { productId: id } });
        await tx.productSection.createMany({
          data: patch.sections.map((s, idx) => ({
            productId: id,
            type: s.type,
            title: s.title,
            body: s.items.join("\n"),
            order: idx
          }))
        });
      }
      if (patch.faqs) {
        await tx.productFAQ.deleteMany({ where: { productId: id } });
        await tx.productFAQ.createMany({
          data: patch.faqs.map((f, idx) => ({ productId: id, question: f.question, answer: f.answer, order: idx }))
        });
      }
      if (patch.references) {
        await tx.referenceLink.deleteMany({ where: { productId: id } });
        await tx.referenceLink.createMany({
          data: patch.references.map((referenceId) => ({ productId: id, referenceId }))
        });
      }

      return tx.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    });

    return updated ? toProduct(updated) : undefined;
  }
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // --- Research ---
  async listReferences(filter?: ReferenceFilter): Promise<ResearchReference[]> {
    const rows = await prisma.researchReference.findMany({
      where: {
        evidenceLevel: filter?.evidenceLevel,
        ...(filter?.source ? { source: { name: filter.source } } : {}),
        ...(filter?.q
          ? {
              OR: [
                { title: { contains: filter.q, mode: "insensitive" } },
                { authors: { contains: filter.q, mode: "insensitive" } },
                { journal: { contains: filter.q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: { source: true },
      orderBy: { year: "desc" }
    });
    return rows.map(toRef);
  }
  async getReferencesByIds(ids: string[]): Promise<ResearchReference[]> {
    const rows = await prisma.researchReference.findMany({
      where: { id: { in: ids } },
      include: { source: true }
    });
    const byId = new Map(rows.map((r) => [r.id, toRef(r)]));
    return ids.map((id) => byId.get(id)).filter((r): r is ResearchReference => Boolean(r));
  }
  async hasReference(doi?: string, title?: string): Promise<boolean> {
    const or: object[] = [];
    if (doi) or.push({ doi: { equals: doi, mode: "insensitive" } });
    if (title) or.push({ title: { equals: title, mode: "insensitive" } });
    if (or.length === 0) return false;
    const count = await prisma.researchReference.count({ where: { OR: or } });
    return count > 0;
  }
  async addReference(ref: Omit<ResearchReference, "id" | "createdAt">): Promise<ResearchReference> {
    let sourceId: string | undefined;
    if (ref.source) {
      const src = await prisma.researchSource.upsert({
        where: { name: ref.source },
        update: {},
        create: { name: ref.source }
      });
      sourceId = src.id;
    }
    const created = await prisma.researchReference.create({
      data: {
        title: ref.title,
        authors: ref.authors,
        journal: ref.journal,
        year: ref.year,
        doi: ref.doi,
        url: ref.url,
        evidenceLevel: ref.evidenceLevel,
        summary: ref.summary,
        sourceId
      },
      include: { source: true }
    });
    return toRef(created);
  }

  // --- Courses (LMS) ---
  async listCourses(filter?: CourseFilter): Promise<Course[]> {
    const rows = await prisma.course.findMany({
      where: {
        audience: filter?.audience,
        level: filter?.level,
        published: typeof filter?.published === "boolean" ? filter.published : undefined,
        ...(filter?.q
          ? {
              OR: [
                { title: { contains: filter.q, mode: "insensitive" } },
                { description: { contains: filter.q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: COURSE_INCLUDE,
      orderBy: { title: "asc" }
    });
    return rows.map(toCourse);
  }
  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    const c = await prisma.course.findUnique({ where: { slug }, include: COURSE_INCLUDE });
    return c ? toCourse(c) : undefined;
  }
  async getCourseById(id: string): Promise<Course | undefined> {
    const c = await prisma.course.findUnique({ where: { id }, include: COURSE_INCLUDE });
    return c ? toCourse(c) : undefined;
  }
  async createCourse(data: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<Course> {
    const created = await prisma.course.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        audience: data.audience,
        level: data.level,
        coverImage: data.coverImage,
        published: data.published,
        i18n: { accent: data.accent, durationMins: data.durationMins },
        modules: {
          create: data.modules.map((m, mIdx) => ({
            title: m.title,
            order: mIdx,
            i18n: { summary: m.summary },
            lessons: {
              create: m.lessons.map((l, lIdx) => ({
                title: l.title,
                contentType: l.contentType,
                body: l.body,
                mediaUrl: l.mediaUrl,
                order: lIdx,
                i18n: { durationMins: l.durationMins }
              }))
            }
          }))
        },
        ...(data.quiz
          ? {
              quizzes: {
                create: [
                  {
                    title: data.quiz.title,
                    passScore: data.quiz.passScore,
                    questions: {
                      create: data.quiz.questions.map((q) => ({
                        prompt: q.prompt,
                        type: q.type,
                        options: q.options,
                        correct: q.correct,
                        explanation: q.explanation
                      }))
                    }
                  }
                ]
              }
            }
          : {})
      },
      include: COURSE_INCLUDE
    });
    return toCourse(created);
  }
  async updateCourse(id: string, patch: Partial<Course>): Promise<Course | undefined> {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return undefined;
    const prevI18n = (existing.i18n ?? {}) as CourseI18n;
    const i18n: CourseI18n = {
      accent: patch.accent ?? prevI18n.accent,
      durationMins: patch.durationMins ?? prevI18n.durationMins
    };
    const updated = await prisma.course.update({
      where: { id },
      data: {
        slug: patch.slug,
        title: patch.title,
        description: patch.description,
        audience: patch.audience,
        level: patch.level,
        coverImage: patch.coverImage,
        published: patch.published,
        i18n: i18n as object
      },
      include: COURSE_INCLUDE
    });
    return toCourse(updated);
  }
  async deleteCourse(id: string): Promise<boolean> {
    try {
      await prisma.course.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  async findQuizById(quizId: string): Promise<QuizLocation | undefined> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, course: true }
    });
    if (!quiz) return undefined;
    const courseId = quiz.courseId ?? quiz.course?.id ?? "";
    return {
      quiz: toQuiz(quiz),
      courseId,
      courseTitle: quiz.course?.title ?? ""
    };
  }

  // --- Enrollments & progress ---
  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const row = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId }
    });
    return toEnrollment(row);
  }
  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const row = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    return row ? toEnrollment(row) : undefined;
  }
  async listEnrollments(userId: string): Promise<Enrollment[]> {
    const rows = await prisma.enrollment.findMany({ where: { userId } });
    return rows.map(toEnrollment);
  }
  async completeCourse(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (!existing) return undefined;
    const row = await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { status: "COMPLETED", progressPct: 100, completedAt: new Date() }
    });
    return toEnrollment(row);
  }

  // --- Quiz attempts & certificates ---
  async recordAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt> {
    const row = await prisma.quizAttempt.create({
      data: {
        userId: attempt.userId,
        quizId: attempt.quizId,
        score: attempt.score,
        passed: attempt.passed,
        answers: []
      }
    });
    return { ...attempt, id: row.id, createdAt: row.createdAt.toISOString() };
  }
  async listAttempts(userId: string, courseId?: string): Promise<QuizAttempt[]> {
    const rows = await prisma.quizAttempt.findMany({
      where: {
        userId,
        ...(courseId ? { quiz: { courseId } } : {})
      },
      include: { quiz: true }
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      quizId: r.quizId,
      courseId: r.quiz.courseId ?? "",
      score: r.score,
      passed: r.passed,
      createdAt: r.createdAt.toISOString()
    }));
  }
  async issueCertificate(userId: string, course: Course): Promise<Certificate> {
    const existing = await prisma.certificate.findFirst({
      where: { userId, courseId: course.id }
    });
    if (existing) {
      return {
        id: existing.id,
        userId: existing.userId,
        courseId: existing.courseId,
        courseTitle: course.title,
        serial: existing.serial,
        issuedAt: existing.issuedAt.toISOString()
      };
    }
    const serial = `ASTRO-${course.slug.slice(0, 6).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 10)
      .toUpperCase()}`;
    const row = await prisma.certificate.create({
      data: { userId, courseId: course.id, serial }
    });
    return {
      id: row.id,
      userId: row.userId,
      courseId: row.courseId,
      courseTitle: course.title,
      serial: row.serial,
      issuedAt: row.issuedAt.toISOString()
    };
  }
  async hasCertificate(userId: string, courseId: string): Promise<boolean> {
    const count = await prisma.certificate.count({ where: { userId, courseId } });
    return count > 0;
  }
  async listCertificates(userId: string): Promise<Certificate[]> {
    const rows = await prisma.certificate.findMany({
      where: { userId },
      include: { course: true }
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      courseId: r.courseId,
      courseTitle: r.course.title,
      serial: r.serial,
      issuedAt: r.issuedAt.toISOString()
    }));
  }

  // --- Geography & facilities ---
  async listZones(): Promise<GeoZone[]> {
    const rows = await prisma.geopoliticalZone.findMany({ orderBy: { name: "asc" } });
    return rows.map((z) => ({ id: z.id, name: z.name, code: deriveZoneCode(z.name) }));
  }
  async listStates(zoneId?: string): Promise<GeoState[]> {
    const rows = await prisma.stateRegion.findMany({
      where: zoneId ? { zoneId } : undefined,
      orderBy: { name: "asc" }
    });
    return rows.map((s) => ({
      id: s.id,
      zoneId: s.zoneId ?? "",
      name: s.name,
      capital: s.code ?? undefined
    }));
  }
  async listFacilities(filter: FacilityFilter = {}): Promise<Facility[]> {
    const rows = await prisma.facility.findMany({
      where: {
        ...(filter.zoneId ? { zoneId: filter.zoneId } : {}),
        ...(filter.stateId ? { stateId: filter.stateId } : {}),
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.q ? { name: { contains: filter.q, mode: "insensitive" } } : {})
      },
      orderBy: { name: "asc" }
    });
    return rows.map(toFacility);
  }
  async getFacilityById(id: string): Promise<Facility | undefined> {
    const row = await prisma.facility.findUnique({ where: { id } });
    return row ? toFacility(row) : undefined;
  }
  async hasFacility(name: string, stateId: string): Promise<boolean> {
    const count = await prisma.facility.count({
      where: { stateId, name: { equals: name, mode: "insensitive" } }
    });
    return count > 0;
  }
  async addFacility(data: Omit<Facility, "id" | "createdAt">): Promise<Facility> {
    const state = await prisma.stateRegion.findUnique({ where: { id: data.stateId } });
    const countryId =
      state?.countryId ?? (await prisma.country.findFirst())?.id ?? "";
    const row = await prisma.facility.create({
      data: {
        countryId,
        zoneId: data.zoneId,
        stateId: data.stateId,
        name: data.name,
        type: data.type,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        source: data.source,
        verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null
      }
    });
    return toFacility(row);
  }

  // --- Specialist Doctors Directory ---
  async listDoctors(filter: DoctorFilter = {}): Promise<Doctor[]> {
    const rows = await prisma.doctor.findMany({
      where: {
        ...(filter.specialty ? { specialty: filter.specialty } : {}),
        ...(filter.facilityId ? { facilityId: filter.facilityId } : {}),
        ...(filter.stateId ? { stateId: filter.stateId } : {}),
        ...(filter.zoneId ? { zoneId: filter.zoneId } : {}),
        ...(filter.q
          ? {
              OR: [
                { fullName: { contains: filter.q, mode: "insensitive" } },
                { hospitalName: { contains: filter.q, mode: "insensitive" } },
                { city: { contains: filter.q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { fullName: "asc" }
    });
    return rows.map(toDoctor);
  }
  async getDoctorById(id: string): Promise<Doctor | undefined> {
    const row = await prisma.doctor.findUnique({ where: { id } });
    return row ? toDoctor(row) : undefined;
  }
  async hasDoctor(fullName: string, facilityId?: string): Promise<boolean> {
    const count = await prisma.doctor.count({
      where: {
        fullName: { equals: fullName, mode: "insensitive" },
        ...(facilityId ? { facilityId } : {})
      }
    });
    return count > 0;
  }
  async addDoctor(data: Omit<Doctor, "id" | "createdAt">): Promise<Doctor> {
    const row = await prisma.doctor.create({
      data: {
        fullName: data.fullName,
        title: data.title,
        specialty: data.specialty,
        facilityId: data.facilityId,
        hospitalName: data.hospitalName,
        zoneId: data.zoneId,
        stateId: data.stateId,
        city: data.city,
        phone: data.phone,
        email: data.email,
        website: data.website,
        source: data.source,
        verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null
      }
    });
    return toDoctor(row);
  }

  // --- CRM ---
  async listContacts(filter: ContactFilter = {}): Promise<Contact[]> {
    const rows = await prisma.contact.findMany({
      where: {
        ...(filter.facilityId ? { facilityId: filter.facilityId } : {}),
        ...(filter.role ? { role: filter.role } : {}),
        ...(filter.q ? { fullName: { contains: filter.q, mode: "insensitive" } } : {})
      },
      orderBy: { fullName: "asc" }
    });
    return rows.map(toContact);
  }
  async getContactById(id: string): Promise<Contact | undefined> {
    const row = await prisma.contact.findUnique({ where: { id } });
    return row ? toContact(row) : undefined;
  }
  async createContact(data: Omit<Contact, "id" | "createdAt">): Promise<Contact> {
    const row = await prisma.contact.create({
      data: {
        fullName: data.fullName,
        title: data.title,
        role: data.role,
        phone: data.phone,
        email: data.email,
        facilityId: data.facilityId,
        consentAt: data.consentAt ? new Date(data.consentAt) : null,
        i18n: data.organization ? { organization: data.organization } : undefined
      }
    });
    return toContact(row);
  }
  async listInteractions(contactId?: string): Promise<Interaction[]> {
    const rows = await prisma.interaction.findMany({
      where: contactId ? { contactId } : undefined,
      orderBy: { occurredAt: "desc" }
    });
    return rows.map(toInteraction);
  }
  async createInteraction(
    data: Omit<Interaction, "id" | "createdAt">
  ): Promise<Interaction> {
    const row = await prisma.interaction.create({
      data: {
        contactId: data.contactId,
        facilityId: data.facilityId,
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        notes: data.notes,
        occurredAt: new Date(data.occurredAt)
      }
    });
    return toInteraction(row);
  }
  async listFollowUps(filter: FollowUpFilter = {}): Promise<FollowUp[]> {
    const rows = await prisma.followUp.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.contactId ? { contactId: filter.contactId } : {})
      }
    });
    return rows.map(toFollowUp);
  }
  async createFollowUp(data: Omit<FollowUp, "id" | "createdAt">): Promise<FollowUp> {
    const row = await prisma.followUp.create({
      data: {
        interactionId: data.interactionId,
        contactId: data.contactId,
        assigneeId: data.assigneeId,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        status: data.status,
        notes: data.notes
      }
    });
    return toFollowUp(row);
  }
  async updateFollowUpStatus(
    id: string,
    status: FollowUp["status"]
  ): Promise<FollowUp | undefined> {
    const existing = await prisma.followUp.findUnique({ where: { id } });
    if (!existing) return undefined;
    const row = await prisma.followUp.update({ where: { id }, data: { status } });
    return toFollowUp(row);
  }

  // --- Campaigns ---
  async listCampaigns(filter: CampaignFilter = {}): Promise<Campaign[]> {
    const rows = await prisma.campaign.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.q ? { name: { contains: filter.q, mode: "insensitive" } } : {})
      },
      orderBy: { name: "asc" }
    });
    return rows.map(toCampaign).filter((c) => !filter.channel || c.channel === filter.channel);
  }
  async getCampaignById(id: string): Promise<Campaign | undefined> {
    const row = await prisma.campaign.findUnique({ where: { id } });
    return row ? toCampaign(row) : undefined;
  }
  async createCampaign(data: Omit<Campaign, "id" | "createdAt">): Promise<Campaign> {
    const row = await prisma.campaign.create({
      data: {
        name: data.name,
        status: data.status,
        ownerId: data.createdById,
        territory: data.audience,
        startDate: data.startAt ? new Date(data.startAt) : null,
        endDate: data.endAt ? new Date(data.endAt) : null,
        objectives: {
          objective: data.objective,
          channel: data.channel,
          productSlugs: data.productSlugs,
          createdById: data.createdById,
          createdAt: new Date().toISOString()
        }
      }
    });
    return toCampaign(row);
  }
  async updateCampaignStatus(
    id: string,
    status: Campaign["status"]
  ): Promise<Campaign | undefined> {
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) return undefined;
    const row = await prisma.campaign.update({ where: { id }, data: { status } });
    return toCampaign(row);
  }

  // --- Seminars & registrations ---
  async listSeminars(filter: SeminarFilter = {}): Promise<Seminar[]> {
    const rows = await prisma.seminar.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.campaignId ? { campaignId: filter.campaignId } : {}),
        ...(filter.upcoming ? { scheduledAt: { gte: new Date() } } : {}),
        ...(filter.q ? { title: { contains: filter.q, mode: "insensitive" } } : {})
      },
      orderBy: { scheduledAt: "asc" }
    });
    return rows.map(toSeminar);
  }
  async getSeminarById(id: string): Promise<Seminar | undefined> {
    const row = await prisma.seminar.findUnique({ where: { id } });
    return row ? toSeminar(row) : undefined;
  }
  async createSeminar(data: Omit<Seminar, "id" | "createdAt">): Promise<Seminar> {
    const row = await prisma.seminar.create({
      data: {
        title: data.title,
        type: "WORKSHOP",
        status: data.status,
        campaignId: data.campaignId,
        facilityId: data.facilityId,
        venue: data.venue,
        imageUrl: data.imageUrl,
        scheduledAt: new Date(data.startAt),
        organizerId: data.createdById
      }
    });
    return toSeminar(row);
  }
  async updateSeminarStatus(
    id: string,
    status: Seminar["status"]
  ): Promise<Seminar | undefined> {
    const existing = await prisma.seminar.findUnique({ where: { id } });
    if (!existing) return undefined;
    const row = await prisma.seminar.update({ where: { id }, data: { status } });
    return toSeminar(row);
  }
  async listRegistrations(seminarId: string): Promise<SeminarRegistration[]> {
    const rows = await prisma.seminarAttendee.findMany({
      where: { seminarId },
      orderBy: { signedInAt: "asc" }
    });
    return rows.map(toRegistration);
  }
  async countRegistrations(seminarId: string): Promise<number> {
    return prisma.seminarAttendee.count({ where: { seminarId } });
  }
  async registerForSeminar(
    data: Omit<SeminarRegistration, "id" | "createdAt">
  ): Promise<SeminarRegistration> {
    const row = await prisma.seminarAttendee.create({
      data: {
        seminarId: data.seminarId,
        contactId: data.contactId,
        name: data.fullName,
        role: data.organization
      }
    });
    return { ...toRegistration(row), status: data.status };
  }
  async updateRegistrationStatus(
    id: string,
    status: SeminarRegistration["status"]
  ): Promise<SeminarRegistration | undefined> {
    const row = await prisma.seminarAttendee.findUnique({ where: { id } });
    if (!row) return undefined;
    return { ...toRegistration(row), status };
  }

  // --- Training of Trainers (TOT) ---
  async listTrainers(filter: TrainerFilter = {}): Promise<Trainer[]> {
    const rows = await prisma.trainerProfile.findMany({
      where: filter.status ? { status: filter.status } : undefined,
      include: { user: true }
    });
    return rows.map(toTrainer).filter((t) => {
      if (filter.courseId && t.courseId !== filter.courseId) return false;
      if (filter.q && !t.fullName.toLowerCase().includes(filter.q.toLowerCase())) return false;
      return true;
    });
  }
  async getTrainerById(id: string): Promise<Trainer | undefined> {
    const row = await prisma.trainerProfile.findUnique({
      where: { id },
      include: { user: true }
    });
    return row ? toTrainer(row) : undefined;
  }
  async createTrainer(data: Omit<Trainer, "id" | "createdAt">): Promise<Trainer> {
    const row = await prisma.trainerProfile.create({
      data: {
        userId: data.userId ?? data.createdById,
        status: data.status,
        bio: data.specialty
      },
      include: { user: true }
    });
    return { ...toTrainer(row), fullName: data.fullName };
  }
  async updateTrainerStatus(
    id: string,
    status: Trainer["status"]
  ): Promise<Trainer | undefined> {
    const existing = await prisma.trainerProfile.findUnique({ where: { id } });
    if (!existing) return undefined;
    const row = await prisma.trainerProfile.update({
      where: { id },
      data: { status },
      include: { user: true }
    });
    return toTrainer(row);
  }
  async listAssessments(trainerId: string): Promise<TrainerAssessment[]> {
    const rows = await prisma.competencyAssessment.findMany({
      where: { trainerProfileId: trainerId },
      include: { competency: true },
      orderBy: { createdAt: "asc" }
    });
    return rows.map(toAssessment);
  }
  async createAssessment(
    data: Omit<TrainerAssessment, "id" | "createdAt">
  ): Promise<TrainerAssessment> {
    const key = data.competency.trim().toLowerCase().replace(/\s+/g, "-");
    const competency = await prisma.competency.upsert({
      where: { key },
      create: { key, name: data.competency },
      update: {}
    });
    const row = await prisma.competencyAssessment.create({
      data: {
        trainerProfileId: data.trainerId,
        competencyId: competency.id,
        score: data.score,
        assessorId: data.assessorId,
        notes: data.notes
      },
      include: { competency: true }
    });
    return toAssessment(row);
  }
}
