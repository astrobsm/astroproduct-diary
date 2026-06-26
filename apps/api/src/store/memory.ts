import { randomUUID } from "node:crypto";
import type {
  Campaign,
  Certificate,
  Contact,
  Course,
  Enrollment,
  Facility,
  FollowUp,
  GeoState,
  GeoZone,
  Interaction,
  Product,
  QuizAttempt,
  ResearchReference,
  Seminar,
  SeminarRegistration,
  Trainer,
  TrainerAssessment,
  User
} from "../domain/types";
import { seedProducts, seedReferences } from "../data/seed";
import { seedCourses } from "../data/courses";
import { geoStates, geoZones } from "../data/geography";
import { hashPassword } from "../auth/security";
import type {
  CampaignFilter,
  ContactFilter,
  CourseFilter,
  FacilityFilter,
  FollowUpFilter,
  ProductFilter,
  QuizLocation,
  ReferenceFilter,
  Repository,
  SeminarFilter,
  TrainerFilter
} from "./repository";

/**
 * In-memory implementation of {@link Repository}, seeded from official content.
 * Data resets on restart — development backend only.
 */
export class MemoryRepository implements Repository {
  private products: Product[] = structuredClone(seedProducts);
  private references: ResearchReference[] = structuredClone(seedReferences);
  private users: User[] = [];
  private courses: Course[] = structuredClone(seedCourses);
  private enrollments: Enrollment[] = [];
  private attempts: QuizAttempt[] = [];
  private certificates: Certificate[] = [];
  private zones: GeoZone[] = structuredClone(geoZones);
  private states: GeoState[] = structuredClone(geoStates);
  private facilities: Facility[] = [];
  private contacts: Contact[] = [];
  private interactions: Interaction[] = [];
  private followUps: FollowUp[] = [];
  private campaigns: Campaign[] = [];
  private seminars: Seminar[] = [];
  private registrations: SeminarRegistration[] = [];
  private trainers: Trainer[] = [];
  private assessments: TrainerAssessment[] = [];
  constructor() {
    // Seed a default Product Manager so protected endpoints are usable in dev.
    // Override with env; never ship default credentials to production.
    const email = process.env.SEED_ADMIN_EMAIL ?? "manager@astrobsm.local";
    const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!123";
    this.users.push({
      id: randomUUID(),
      email,
      passwordHash: hashPassword(password),
      fullName: "Product Manager",
      roles: ["PRODUCT_MANAGER", "MEDICAL_DIRECTOR"],
      locale: "en",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    });

    // Seed the platform administrator (phone-based login). Credentials can be
    // overridden via env; the defaults match the commissioning request.
    const adminPhone = process.env.SEED_SUPERADMIN_PHONE ?? "08033328385";
    const adminPassword = process.env.SEED_SUPERADMIN_PASSWORD ?? "blackvelvet";
    this.users.push({
      id: randomUUID(),
      email: process.env.SEED_SUPERADMIN_EMAIL ?? "admin@astrobsm.local",
      phone: adminPhone,
      passwordHash: hashPassword(adminPassword),
      fullName: "Platform Administrator",
      roles: ["ADMIN", "PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "TRAINER"],
      locale: "en",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    });
  }

  // --- Users ---
  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  async findUserById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }
  async findUserByIdentifier(identifier: string): Promise<User | undefined> {
    const id = identifier.trim().toLowerCase();
    const digits = id.replace(/[^\d]/g, "");
    return this.users.find(
      (u) =>
        u.email.toLowerCase() === id ||
        (u.phone ? u.phone.replace(/[^\d]/g, "") === digits && digits.length > 0 : false)
    );
  }
  async createPendingUser(
    data: Omit<User, "id" | "status" | "roles"> & { requestedRoles: string[] }
  ): Promise<User> {
    const user: User = {
      ...data,
      id: randomUUID(),
      roles: [],
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  }
  async listUsers(status?: User["status"]): Promise<User[]> {
    const list = status ? this.users.filter((u) => u.status === status) : this.users;
    return list
      .slice()
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }
  async approveUser(
    id: string,
    approvedById: string,
    roles?: string[]
  ): Promise<User | undefined> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return undefined;
    user.status = "ACTIVE";
    user.roles = roles && roles.length > 0 ? roles : user.requestedRoles ?? user.roles;
    user.approvedAt = new Date().toISOString();
    user.approvedById = approvedById;
    return user;
  }
  async rejectUser(id: string, approvedById: string): Promise<User | undefined> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return undefined;
    user.status = "REJECTED";
    user.approvedAt = new Date().toISOString();
    user.approvedById = approvedById;
    return user;
  }

  // --- Products ---
  async listProducts(filter?: ProductFilter): Promise<Product[]> {
    let result = this.products;
    if (filter?.category) result = result.filter((p) => p.category === filter.category);
    if (filter?.status) result = result.filter((p) => p.status === filter.status);
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
      );
    }
    return result;
  }
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return this.products.find((p) => p.slug === slug);
  }
  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.find((p) => p.id === id);
  }
  async createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const now = new Date().toISOString();
    const product: Product = { ...data, id: `prod-${randomUUID()}`, createdAt: now, updatedAt: now };
    this.products.push(product);
    return product;
  }
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | undefined> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const updated = {
      ...this.products[idx],
      ...patch,
      id,
      updatedAt: new Date().toISOString()
    };
    this.products[idx] = updated;
    return updated;
  }
  async deleteProduct(id: string): Promise<boolean> {
    const before = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    return this.products.length < before;
  }

  // --- Research ---
  async listReferences(filter?: ReferenceFilter): Promise<ResearchReference[]> {
    let result = this.references;
    if (filter?.source) result = result.filter((r) => r.source === filter.source);
    if (filter?.evidenceLevel)
      result = result.filter((r) => r.evidenceLevel === filter.evidenceLevel);
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.authors.toLowerCase().includes(q) ||
          r.journal.toLowerCase().includes(q)
      );
    }
    return result;
  }
  async getReferencesByIds(ids: string[]): Promise<ResearchReference[]> {
    return ids
      .map((id) => this.references.find((r) => r.id === id))
      .filter((r): r is ResearchReference => Boolean(r));
  }
  async hasReference(doi?: string, title?: string): Promise<boolean> {
    return this.references.some(
      (r) =>
        Boolean(doi && r.doi && r.doi.toLowerCase() === doi.toLowerCase()) ||
        Boolean(title && r.title.toLowerCase() === title.toLowerCase())
    );
  }
  async addReference(ref: Omit<ResearchReference, "id" | "createdAt">): Promise<ResearchReference> {
    const created: ResearchReference = {
      ...ref,
      id: `ref-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.references.push(created);
    return created;
  }

  // --- Courses (LMS) ---
  async listCourses(filter?: CourseFilter): Promise<Course[]> {
    let result = this.courses;
    if (filter?.audience) result = result.filter((c) => c.audience === filter.audience);
    if (filter?.level) result = result.filter((c) => c.level === filter.level);
    if (typeof filter?.published === "boolean")
      result = result.filter((c) => c.published === filter.published);
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return result;
  }
  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    return this.courses.find((c) => c.slug === slug);
  }
  async getCourseById(id: string): Promise<Course | undefined> {
    return this.courses.find((c) => c.id === id);
  }
  async createCourse(data: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<Course> {
    const now = new Date().toISOString();
    const course: Course = { ...data, id: `course-${randomUUID()}`, createdAt: now, updatedAt: now };
    this.courses.push(course);
    return course;
  }
  async updateCourse(id: string, patch: Partial<Course>): Promise<Course | undefined> {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.courses[idx], ...patch, id, updatedAt: new Date().toISOString() };
    this.courses[idx] = updated;
    return updated;
  }
  async deleteCourse(id: string): Promise<boolean> {
    const before = this.courses.length;
    this.courses = this.courses.filter((c) => c.id !== id);
    return this.courses.length < before;
  }
  async findQuizById(quizId: string): Promise<QuizLocation | undefined> {
    for (const course of this.courses) {
      if (course.quiz && course.quiz.id === quizId) {
        return { quiz: course.quiz, courseId: course.id, courseTitle: course.title };
      }
    }
    return undefined;
  }

  // --- Enrollments & progress ---
  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const existing = this.enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
    if (existing) return existing;
    const enrollment: Enrollment = {
      id: `enr-${randomUUID()}`,
      userId,
      courseId,
      status: "ACTIVE",
      progressPct: 0,
      startedAt: new Date().toISOString()
    };
    this.enrollments.push(enrollment);
    return enrollment;
  }
  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    return this.enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  }
  async listEnrollments(userId: string): Promise<Enrollment[]> {
    return this.enrollments.filter((e) => e.userId === userId);
  }
  async completeCourse(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const enrollment = this.enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
    if (!enrollment) return undefined;
    enrollment.status = "COMPLETED";
    enrollment.progressPct = 100;
    enrollment.completedAt = new Date().toISOString();
    return enrollment;
  }

  // --- Quiz attempts & certificates ---
  async recordAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt> {
    const created: QuizAttempt = {
      ...attempt,
      id: `att-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.attempts.push(created);
    return created;
  }
  async listAttempts(userId: string, courseId?: string): Promise<QuizAttempt[]> {
    return this.attempts.filter(
      (a) => a.userId === userId && (!courseId || a.courseId === courseId)
    );
  }
  async issueCertificate(userId: string, course: Course): Promise<Certificate> {
    const existing = this.certificates.find(
      (c) => c.userId === userId && c.courseId === course.id
    );
    if (existing) return existing;
    const serial = `ASTRO-${course.slug.slice(0, 6).toUpperCase()}-${randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;
    const certificate: Certificate = {
      id: `cert-${randomUUID()}`,
      userId,
      courseId: course.id,
      courseTitle: course.title,
      serial,
      issuedAt: new Date().toISOString()
    };
    this.certificates.push(certificate);
    return certificate;
  }
  async hasCertificate(userId: string, courseId: string): Promise<boolean> {
    return this.certificates.some((c) => c.userId === userId && c.courseId === courseId);
  }
  async listCertificates(userId: string): Promise<Certificate[]> {
    return this.certificates.filter((c) => c.userId === userId);
  }

  // --- Geography & facilities ---
  async listZones(): Promise<GeoZone[]> {
    return this.zones;
  }
  async listStates(zoneId?: string): Promise<GeoState[]> {
    return zoneId ? this.states.filter((s) => s.zoneId === zoneId) : this.states;
  }
  async listFacilities(filter: FacilityFilter = {}): Promise<Facility[]> {
    const q = filter.q?.trim().toLowerCase();
    return this.facilities.filter((f) => {
      if (filter.zoneId && f.zoneId !== filter.zoneId) return false;
      if (filter.stateId && f.stateId !== filter.stateId) return false;
      if (filter.type && f.type !== filter.type) return false;
      if (q && !`${f.name} ${f.city ?? ""} ${f.address ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }
  async getFacilityById(id: string): Promise<Facility | undefined> {
    return this.facilities.find((f) => f.id === id);
  }
  async hasFacility(name: string, stateId: string): Promise<boolean> {
    const norm = name.trim().toLowerCase();
    return this.facilities.some(
      (f) => f.stateId === stateId && f.name.trim().toLowerCase() === norm
    );
  }
  async addFacility(data: Omit<Facility, "id" | "createdAt">): Promise<Facility> {
    const facility: Facility = {
      ...data,
      id: `fac-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.facilities.push(facility);
    return facility;
  }

  // --- CRM ---
  async listContacts(filter: ContactFilter = {}): Promise<Contact[]> {
    const q = filter.q?.trim().toLowerCase();
    return this.contacts.filter((c) => {
      if (filter.facilityId && c.facilityId !== filter.facilityId) return false;
      if (filter.role && c.role !== filter.role) return false;
      if (q && !`${c.fullName} ${c.organization ?? ""} ${c.email ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }
  async getContactById(id: string): Promise<Contact | undefined> {
    return this.contacts.find((c) => c.id === id);
  }
  async createContact(data: Omit<Contact, "id" | "createdAt">): Promise<Contact> {
    const contact: Contact = {
      ...data,
      id: `con-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.contacts.push(contact);
    return contact;
  }
  async listInteractions(contactId?: string): Promise<Interaction[]> {
    const list = contactId
      ? this.interactions.filter((i) => i.contactId === contactId)
      : this.interactions;
    return [...list].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
  async createInteraction(data: Omit<Interaction, "id" | "createdAt">): Promise<Interaction> {
    const interaction: Interaction = {
      ...data,
      id: `int-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.interactions.push(interaction);
    return interaction;
  }
  async listFollowUps(filter: FollowUpFilter = {}): Promise<FollowUp[]> {
    return this.followUps.filter((f) => {
      if (filter.status && f.status !== filter.status) return false;
      if (filter.contactId && f.contactId !== filter.contactId) return false;
      return true;
    });
  }
  async createFollowUp(data: Omit<FollowUp, "id" | "createdAt">): Promise<FollowUp> {
    const followUp: FollowUp = {
      ...data,
      id: `fol-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.followUps.push(followUp);
    return followUp;
  }
  async updateFollowUpStatus(
    id: string,
    status: FollowUp["status"]
  ): Promise<FollowUp | undefined> {
    const idx = this.followUps.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    this.followUps[idx] = { ...this.followUps[idx], status };
    return this.followUps[idx];
  }

  // --- Campaigns ---
  async listCampaigns(filter: CampaignFilter = {}): Promise<Campaign[]> {
    const q = filter.q?.trim().toLowerCase();
    return this.campaigns
      .filter((c) => {
        if (filter.status && c.status !== filter.status) return false;
        if (filter.channel && c.channel !== filter.channel) return false;
        if (q && !`${c.name} ${c.objective} ${c.audience ?? ""}`.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async getCampaignById(id: string): Promise<Campaign | undefined> {
    return this.campaigns.find((c) => c.id === id);
  }
  async createCampaign(data: Omit<Campaign, "id" | "createdAt">): Promise<Campaign> {
    const campaign: Campaign = {
      ...data,
      id: `cmp-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.campaigns.push(campaign);
    return campaign;
  }
  async updateCampaignStatus(
    id: string,
    status: Campaign["status"]
  ): Promise<Campaign | undefined> {
    const idx = this.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.campaigns[idx] = { ...this.campaigns[idx], status };
    return this.campaigns[idx];
  }

  // --- Seminars & registrations ---
  async listSeminars(filter: SeminarFilter = {}): Promise<Seminar[]> {
    const q = filter.q?.trim().toLowerCase();
    const now = new Date().toISOString();
    return this.seminars
      .filter((s) => {
        if (filter.status && s.status !== filter.status) return false;
        if (filter.campaignId && s.campaignId !== filter.campaignId) return false;
        if (filter.upcoming && s.startAt < now) return false;
        if (q && !`${s.title} ${s.summary} ${s.city ?? ""}`.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }
  async getSeminarById(id: string): Promise<Seminar | undefined> {
    return this.seminars.find((s) => s.id === id);
  }
  async createSeminar(data: Omit<Seminar, "id" | "createdAt">): Promise<Seminar> {
    const seminar: Seminar = {
      ...data,
      id: `sem-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.seminars.push(seminar);
    return seminar;
  }
  async updateSeminarStatus(
    id: string,
    status: Seminar["status"]
  ): Promise<Seminar | undefined> {
    const idx = this.seminars.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.seminars[idx] = { ...this.seminars[idx], status };
    return this.seminars[idx];
  }
  async listRegistrations(seminarId: string): Promise<SeminarRegistration[]> {
    return this.registrations
      .filter((r) => r.seminarId === seminarId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async countRegistrations(seminarId: string): Promise<number> {
    return this.registrations.filter(
      (r) => r.seminarId === seminarId && r.status !== "CANCELLED"
    ).length;
  }
  async registerForSeminar(
    data: Omit<SeminarRegistration, "id" | "createdAt">
  ): Promise<SeminarRegistration> {
    const registration: SeminarRegistration = {
      ...data,
      id: `reg-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.registrations.push(registration);
    return registration;
  }
  async updateRegistrationStatus(
    id: string,
    status: SeminarRegistration["status"]
  ): Promise<SeminarRegistration | undefined> {
    const idx = this.registrations.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.registrations[idx] = { ...this.registrations[idx], status };
    return this.registrations[idx];
  }

  // --- Training of Trainers (TOT) ---
  async listTrainers(filter: TrainerFilter = {}): Promise<Trainer[]> {
    const q = filter.q?.trim().toLowerCase();
    return this.trainers
      .filter((t) => {
        if (filter.status && t.status !== filter.status) return false;
        if (filter.courseId && t.courseId !== filter.courseId) return false;
        if (
          q &&
          !`${t.fullName} ${t.organization ?? ""} ${t.specialty ?? ""}`
            .toLowerCase()
            .includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
  async getTrainerById(id: string): Promise<Trainer | undefined> {
    return this.trainers.find((t) => t.id === id);
  }
  async createTrainer(data: Omit<Trainer, "id" | "createdAt">): Promise<Trainer> {
    const trainer: Trainer = {
      ...data,
      id: `trn-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.trainers.push(trainer);
    return trainer;
  }
  async updateTrainerStatus(
    id: string,
    status: Trainer["status"]
  ): Promise<Trainer | undefined> {
    const idx = this.trainers.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    const current = this.trainers[idx];
    const becomingCertified = status === "CERTIFIED" && current.status !== "CERTIFIED";
    this.trainers[idx] = {
      ...current,
      status,
      certifiedAt: becomingCertified ? new Date().toISOString() : current.certifiedAt,
      certificateSerial: becomingCertified
        ? `TOT-${current.id.slice(4, 12).toUpperCase()}`
        : current.certificateSerial
    };
    return this.trainers[idx];
  }
  async listAssessments(trainerId: string): Promise<TrainerAssessment[]> {
    return this.assessments
      .filter((a) => a.trainerId === trainerId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async createAssessment(
    data: Omit<TrainerAssessment, "id" | "createdAt">
  ): Promise<TrainerAssessment> {
    const assessment: TrainerAssessment = {
      ...data,
      id: `asm-${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.assessments.push(assessment);
    return assessment;
  }
}
