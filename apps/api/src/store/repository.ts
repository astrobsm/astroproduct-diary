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
  Quiz,
  QuizAttempt,
  ResearchReference,
  Seminar,
  SeminarRegistration,
  Trainer,
  TrainerAssessment,
  User
} from "../domain/types";

export interface ProductFilter {
  category?: string;
  status?: string;
  q?: string;
}

export interface ReferenceFilter {
  source?: string;
  evidenceLevel?: string;
  q?: string;
}

export interface CourseFilter {
  audience?: string;
  level?: string;
  published?: boolean;
  q?: string;
}

/** A quiz located by id together with the course it belongs to (for grading). */
export interface QuizLocation {
  quiz: Quiz;
  courseId: string;
  courseTitle: string;
}

export interface FacilityFilter {
  zoneId?: string;
  stateId?: string;
  type?: string;
  q?: string;
}

export interface ContactFilter {
  facilityId?: string;
  role?: string;
  q?: string;
}

export interface FollowUpFilter {
  status?: string;
  contactId?: string;
}

export interface CampaignFilter {
  status?: string;
  channel?: string;
  q?: string;
}

export interface SeminarFilter {
  status?: string;
  campaignId?: string;
  upcoming?: boolean;
  q?: string;
}

export interface TrainerFilter {
  status?: string;
  courseId?: string;
  q?: string;
}

/**
 * Storage contract shared by every backend (in-memory for dev, Prisma/Postgres
 * for production). Routes depend only on this interface, so the implementation
 * is a drop-in swap selected at startup by {@link createRepository}.
 */
export interface Repository {
  // Users
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserById(id: string): Promise<User | undefined>;
  /** Find a user by phone number or email address (login identifier). */
  findUserByIdentifier(identifier: string): Promise<User | undefined>;
  /** Create a self-registered user awaiting admin approval (status PENDING). */
  createPendingUser(
    data: Omit<User, "id" | "status" | "roles"> & { requestedRoles: string[] }
  ): Promise<User>;
  /** List users, optionally filtered by approval status. */
  listUsers(status?: User["status"]): Promise<User[]>;
  /** Approve a pending user, granting the given roles (defaults to requested). */
  approveUser(id: string, approvedById: string, roles?: string[]): Promise<User | undefined>;
  /** Reject a pending user. */
  rejectUser(id: string, approvedById: string): Promise<User | undefined>;

  // Products
  listProducts(filter?: ProductFilter): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  updateProduct(id: string, patch: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Research
  listReferences(filter?: ReferenceFilter): Promise<ResearchReference[]>;
  getReferencesByIds(ids: string[]): Promise<ResearchReference[]>;
  hasReference(doi?: string, title?: string): Promise<boolean>;
  addReference(ref: Omit<ResearchReference, "id" | "createdAt">): Promise<ResearchReference>;

  // Courses (LMS)
  listCourses(filter?: CourseFilter): Promise<Course[]>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(data: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<Course>;
  updateCourse(id: string, patch: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;
  findQuizById(quizId: string): Promise<QuizLocation | undefined>;

  // Enrollments & progress
  enroll(userId: string, courseId: string): Promise<Enrollment>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  listEnrollments(userId: string): Promise<Enrollment[]>;
  completeCourse(userId: string, courseId: string): Promise<Enrollment | undefined>;

  // Quiz attempts & certificates
  recordAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt>;
  listAttempts(userId: string, courseId?: string): Promise<QuizAttempt[]>;
  issueCertificate(userId: string, course: Course): Promise<Certificate>;
  hasCertificate(userId: string, courseId: string): Promise<boolean>;
  listCertificates(userId: string): Promise<Certificate[]>;

  // Geography & facilities (National Hospital Database)
  listZones(): Promise<GeoZone[]>;
  listStates(zoneId?: string): Promise<GeoState[]>;
  listFacilities(filter?: FacilityFilter): Promise<Facility[]>;
  getFacilityById(id: string): Promise<Facility | undefined>;
  hasFacility(name: string, stateId: string): Promise<boolean>;
  addFacility(data: Omit<Facility, "id" | "createdAt">): Promise<Facility>;

  // CRM
  listContacts(filter?: ContactFilter): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | undefined>;
  createContact(data: Omit<Contact, "id" | "createdAt">): Promise<Contact>;
  listInteractions(contactId?: string): Promise<Interaction[]>;
  createInteraction(data: Omit<Interaction, "id" | "createdAt">): Promise<Interaction>;
  listFollowUps(filter?: FollowUpFilter): Promise<FollowUp[]>;
  createFollowUp(data: Omit<FollowUp, "id" | "createdAt">): Promise<FollowUp>;
  updateFollowUpStatus(id: string, status: FollowUp["status"]): Promise<FollowUp | undefined>;

  // Campaigns
  listCampaigns(filter?: CampaignFilter): Promise<Campaign[]>;
  getCampaignById(id: string): Promise<Campaign | undefined>;
  createCampaign(data: Omit<Campaign, "id" | "createdAt">): Promise<Campaign>;
  updateCampaignStatus(
    id: string,
    status: Campaign["status"]
  ): Promise<Campaign | undefined>;

  // Seminars & registrations
  listSeminars(filter?: SeminarFilter): Promise<Seminar[]>;
  getSeminarById(id: string): Promise<Seminar | undefined>;
  createSeminar(data: Omit<Seminar, "id" | "createdAt">): Promise<Seminar>;
  updateSeminarStatus(
    id: string,
    status: Seminar["status"]
  ): Promise<Seminar | undefined>;
  listRegistrations(seminarId: string): Promise<SeminarRegistration[]>;
  countRegistrations(seminarId: string): Promise<number>;
  registerForSeminar(
    data: Omit<SeminarRegistration, "id" | "createdAt">
  ): Promise<SeminarRegistration>;
  updateRegistrationStatus(
    id: string,
    status: SeminarRegistration["status"]
  ): Promise<SeminarRegistration | undefined>;

  // Training of Trainers (TOT)
  listTrainers(filter?: TrainerFilter): Promise<Trainer[]>;
  getTrainerById(id: string): Promise<Trainer | undefined>;
  createTrainer(data: Omit<Trainer, "id" | "createdAt">): Promise<Trainer>;
  updateTrainerStatus(
    id: string,
    status: Trainer["status"]
  ): Promise<Trainer | undefined>;
  listAssessments(trainerId: string): Promise<TrainerAssessment[]>;
  createAssessment(
    data: Omit<TrainerAssessment, "id" | "createdAt">
  ): Promise<TrainerAssessment>;
}
