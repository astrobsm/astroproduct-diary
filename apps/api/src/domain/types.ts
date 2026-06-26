export type Locale = "en" | "fr";

export interface Ingredient {
  name: string;
  percent?: string;
  role: string;
}

export interface ProductSection {
  type:
    | "DESCRIPTION"
    | "MECHANISM"
    | "ADVANTAGES"
    | "INDICATIONS"
    | "APPLICATION"
    | "PRECAUTIONS"
    | "STORAGE";
  title: string;
  items: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  summary: string;
  status: "DRAFT" | "PUBLISHED";
  image?: string;
  ingredients: Ingredient[];
  sections: ProductSection[];
  faqs: FAQ[];
  references: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchReference {
  id: string;
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  source: string;
  evidenceLevel:
    | "Systematic review / meta-analysis"
    | "Meta-analysis"
    | "RCT"
    | "Review"
    | "Laboratory / in-vitro"
    | "Clinical practice"
    | "Guideline";
  summary?: string;
  createdAt: string;
}

export type UserStatus = "PENDING" | "ACTIVE" | "REJECTED";

export interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  fullName: string;
  roles: string[];
  locale: Locale;
  /** Self-registered users start PENDING until an admin approves them. */
  status: UserStatus;
  /** Roles the user requested at sign-up (granted on approval). */
  requestedRoles?: string[];
  createdAt?: string;
  approvedAt?: string;
  approvedById?: string;
}

// --- Learning Management System (LMS) ---

export type CourseAudience =
  | "EXECUTIVE"
  | "MARKETING"
  | "CUSTOMER_CARE"
  | "SALES"
  | "DISTRIBUTOR"
  | "CLINICAL"
  | "TOT";

export type CourseLevel = "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";

export interface Lesson {
  id: string;
  title: string;
  contentType: "TEXT" | "VIDEO" | "PDF";
  /** Markdown/plain body for TEXT lessons. */
  body?: string;
  /** External media URL for VIDEO/PDF lessons. */
  mediaUrl?: string;
  durationMins?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  summary?: string;
  lessons: Lesson[];
}

export type QuestionType = "SINGLE" | "MULTI" | "TRUE_FALSE";

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: QuestionType;
  options: string[];
  /** Indices of the correct option(s). Never exposed to learners pre-grading. */
  correct: number[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  /** Minimum percentage (0-100) required to pass. */
  passScore: number;
  questions: QuizQuestion[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: CourseAudience;
  level: CourseLevel;
  coverImage?: string;
  accent?: string;
  durationMins: number;
  published: boolean;
  modules: CourseModule[];
  quiz?: Quiz;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "ACTIVE" | "COMPLETED";
  progressPct: number;
  startedAt: string;
  completedAt?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  courseId: string;
  score: number;
  passed: boolean;
  createdAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  serial: string;
  issuedAt: string;
}

// ---------------------------------------------------------------------------
// National Hospital Database / Geography
// ---------------------------------------------------------------------------

/** A geopolitical zone (e.g. Nigeria's six zones). Public, verifiable geography. */
export interface GeoZone {
  id: string;
  name: string;
  /** ISO-ish short code, e.g. "NC", "SW". */
  code: string;
}

/** A state / region within a zone. Public, verifiable geography. */
export interface GeoState {
  id: string;
  zoneId: string;
  name: string;
  /** Capital city — public reference data. */
  capital?: string;
}

export type FacilityType =
  | "TEACHING_HOSPITAL"
  | "FEDERAL_MEDICAL_CENTRE"
  | "GENERAL_HOSPITAL"
  | "SPECIALIST_HOSPITAL"
  | "PRIMARY_HEALTH_CENTRE"
  | "PRIVATE_HOSPITAL"
  | "CLINIC"
  | "PHARMACY"
  | "OTHER";

/**
 * A health facility (hospital). Contact details are only present when imported
 * from a verifiable source — `source` (provenance) is required and `verifiedAt`
 * records when it was confirmed. Never fabricated.
 */
export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  zoneId: string;
  stateId: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  /** Provenance: where this record was sourced from (URL / register name). */
  source: string;
  verifiedAt?: string;
  /** Derived on read: GREEN when confirmed against an authoritative register, AMBER otherwise. */
  verificationStatus?: "VERIFIED" | "UNVERIFIED";
  createdAt: string;
}

// ---------------------------------------------------------------------------
// CRM
// ---------------------------------------------------------------------------

export type ContactRole =
  | "CLINICIAN"
  | "NURSE"
  | "PHARMACIST"
  | "PROCUREMENT"
  | "ADMIN"
  | "DISTRIBUTOR"
  | "OTHER";

/** A CRM contact — a person at a facility, created by staff. */
export interface Contact {
  id: string;
  fullName: string;
  title?: string;
  role: ContactRole;
  organization?: string;
  facilityId?: string;
  phone?: string;
  email?: string;
  /** When the contact consented to being contacted (data-protection record). */
  consentAt?: string;
  createdById: string;
  createdAt: string;
}

export type InteractionType = "CALL" | "VISIT" | "MEETING" | "EMAIL" | "SEMINAR";

/** A logged interaction with a contact / facility. */
export interface Interaction {
  id: string;
  contactId?: string;
  facilityId?: string;
  userId: string;
  type: InteractionType;
  channel?: string;
  notes?: string;
  occurredAt: string;
  createdAt: string;
}

export type FollowUpStatus = "OPEN" | "DONE" | "CANCELLED";

/** A follow-up task arising from an interaction. */
export interface FollowUp {
  id: string;
  interactionId?: string;
  contactId?: string;
  assigneeId?: string;
  dueAt?: string;
  status: FollowUpStatus;
  notes?: string;
  createdById: string;
  createdAt: string;
}

// --- Campaigns & Seminars ---

export type CampaignChannel = "EMAIL" | "SMS" | "SOCIAL" | "FIELD" | "RADIO" | "EVENT";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

/** A marketing / awareness campaign. */
export interface Campaign {
  id: string;
  name: string;
  objective: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience?: string;
  startAt?: string;
  endAt?: string;
  /** Linked product education slugs, if any. */
  productSlugs: string[];
  createdById: string;
  createdAt: string;
}

export type SeminarStatus = "PLANNED" | "OPEN" | "FULL" | "COMPLETED" | "CANCELLED";

/** A scheduled seminar / training event (CME, product workshop, etc.). */
export interface Seminar {
  id: string;
  title: string;
  summary: string;
  status: SeminarStatus;
  /** Optional link to a campaign that promotes this seminar. */
  campaignId?: string;
  facilityId?: string;
  city?: string;
  stateId?: string;
  venue?: string;
  startAt: string;
  endAt?: string;
  capacity?: number;
  createdById: string;
  createdAt: string;
}

export type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "ATTENDED" | "CANCELLED";

/** A seminar registration for a CRM contact (no fabricated attendees). */
export interface SeminarRegistration {
  id: string;
  seminarId: string;
  contactId?: string;
  fullName: string;
  email?: string;
  phone?: string;
  organization?: string;
  status: RegistrationStatus;
  createdById: string;
  createdAt: string;
}

// --- Training of Trainers (TOT) ---

export type TrainerStatus =
  | "NOMINATED"
  | "IN_TRAINING"
  | "CERTIFIED"
  | "DECLINED"
  | "SUSPENDED";

/** A person being developed into a certified trainer (real nominee, no fabrication). */
export interface Trainer {
  id: string;
  fullName: string;
  userId?: string;
  contactId?: string;
  organization?: string;
  email?: string;
  specialty?: string;
  /** Optional LMS course this trainer is being certified to deliver. */
  courseId?: string;
  status: TrainerStatus;
  certifiedAt?: string;
  certificateSerial?: string;
  createdById: string;
  createdAt: string;
}

/** A competency assessment recorded against a trainer during TOT. */
export interface TrainerAssessment {
  id: string;
  trainerId: string;
  competency: string;
  /** Score 0–100. */
  score: number;
  assessorId?: string;
  notes?: string;
  createdAt: string;
}

