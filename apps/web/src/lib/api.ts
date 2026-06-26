/**
 * Web API client for the ASTROBSM platform.
 *
 * Talks to the Phase 2 API when reachable and lets callers fall back to bundled
 * seed content when offline (PWA / field use). Base URL is configurable via
 * VITE_API_URL.
 */
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export interface ApiRef {
  id: string;
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  source: string;
  evidenceLevel: string;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  summary: string;
  status: string;
  image?: string;
  ingredients: { name: string; percent?: string; role: string }[];
  sections: { type: string; title: string; items: string[] }[];
  faqs: { question: string; answer: string }[];
  references: string[];
  referenceDetails?: ApiRef[];
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  const json = await res.json();
  return json as T;
}

export const api = {
  async products(signal?: AbortSignal): Promise<ApiProduct[]> {
    const { data } = await get<{ data: ApiProduct[] }>("/products", signal);
    return data;
  },
  async product(slug: string, signal?: AbortSignal): Promise<ApiProduct> {
    const { data } = await get<{ data: ApiProduct }>(`/products/${slug}`, signal);
    return data;
  },
  async research(signal?: AbortSignal): Promise<ApiRef[]> {
    const { data } = await get<{ data: ApiRef[] }>("/research", signal);
    return data;
  }
};

// --- LMS (Academy) ---
export interface ApiCourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: string;
  level: string;
  coverImage?: string;
  accent?: string;
  durationMins: number;
  moduleCount: number;
  lessonCount: number;
  hasQuiz: boolean;
}

export interface ApiLesson {
  id: string;
  title: string;
  contentType: "TEXT" | "VIDEO" | "PDF";
  body?: string;
  mediaUrl?: string;
  durationMins?: number;
}

export interface ApiModule {
  id: string;
  title: string;
  summary?: string;
  lessons: ApiLesson[];
}

export interface ApiQuizQuestionPublic {
  id: string;
  prompt: string;
  type: "SINGLE" | "MULTI" | "TRUE_FALSE";
  options: string[];
}

export interface ApiQuizPublic {
  id: string;
  title: string;
  passScore: number;
  questions: ApiQuizQuestionPublic[];
}

export interface ApiCourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: string;
  level: string;
  coverImage?: string;
  accent?: string;
  durationMins: number;
  published: boolean;
  modules: ApiModule[];
  quiz?: ApiQuizPublic;
}

export interface ApiEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "ACTIVE" | "COMPLETED";
  progressPct: number;
  startedAt: string;
  completedAt?: string;
}

export interface ApiCertificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  serial: string;
  issuedAt: string;
}

export interface ApiAttemptAnswer {
  questionId: string;
  selected: number[];
}

export interface ApiAttemptResult {
  score: number;
  passed: boolean;
  passScore: number;
  results: {
    questionId: string;
    correct: boolean;
    correctAnswer: number[];
    explanation?: string;
  }[];
  certificate: ApiCertificate | null;
}

export const lmsApi = {
  async courses(signal?: AbortSignal): Promise<ApiCourseSummary[]> {
    const { data } = await get<{ data: ApiCourseSummary[] }>("/lms/courses", signal);
    return data;
  },
  async course(slug: string, signal?: AbortSignal): Promise<ApiCourseDetail> {
    const { data } = await get<{ data: ApiCourseDetail }>(`/lms/courses/${slug}`, signal);
    return data;
  }
};

// --- National Hospital Database ---
export interface ApiZone {
  id: string;
  name: string;
  code: string;
}

export interface ApiState {
  id: string;
  zoneId: string;
  name: string;
  capital?: string;
}

export interface ApiFacility {
  id: string;
  name: string;
  type: string;
  zoneId: string;
  stateId: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  source: string;
  verifiedAt?: string;
  verificationStatus?: "VERIFIED" | "UNVERIFIED";
  createdAt: string;
}

export interface FacilityQuery {
  zoneId?: string;
  stateId?: string;
  type?: string;
  q?: string;
}

export const hospitalsApi = {
  async zones(signal?: AbortSignal): Promise<ApiZone[]> {
    const { data } = await get<{ data: ApiZone[] }>("/geo/zones", signal);
    return data;
  },
  async states(zoneId?: string, signal?: AbortSignal): Promise<ApiState[]> {
    const qs = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : "";
    const { data } = await get<{ data: ApiState[] }>(`/geo/states${qs}`, signal);
    return data;
  },
  async facilities(query: FacilityQuery = {}, signal?: AbortSignal): Promise<ApiFacility[]> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const { data } = await get<{ data: ApiFacility[] }>(`/facilities${qs}`, signal);
    return data;
  }
};
export interface ProductInput {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  summary: string;
  status: "DRAFT" | "PUBLISHED";
  image?: string;
  ingredients: { name: string; percent?: string; role: string }[];
  sections: { type: string; title: string; items: string[] }[];
  faqs: { question: string; answer: string }[];
  references: string[];
}

type AuthFetch = (path: string, init?: RequestInit) => Promise<Response>;

async function readError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null);
  throw new Error(body?.error?.message ?? `API ${res.status}`);
}

/**
 * Authenticated management calls. Each takes the `authFetch` helper from the
 * auth context so the access token / refresh flow is applied transparently.
 */
export const adminApi = {
  async createProduct(authFetch: AuthFetch, input: ProductInput): Promise<ApiProduct> {
    const res = await authFetch("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiProduct;
  },

  async updateProduct(
    authFetch: AuthFetch,
    id: string,
    patch: Partial<ProductInput>
  ): Promise<ApiProduct> {
    const res = await authFetch(`/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiProduct;
  },

  async deleteProduct(authFetch: AuthFetch, id: string): Promise<void> {
    const res = await authFetch(`/products/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) await readError(res);
  }
};

/**
 * Authenticated Academy (LMS) calls for learners: enroll, submit quiz
 * attempts, and read the current learner's enrollments / certificates.
 */
export const lmsAuthApi = {
  async enroll(authFetch: AuthFetch, courseId: string): Promise<ApiEnrollment> {
    const res = await authFetch("/lms/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiEnrollment;
  },

  async myEnrollments(authFetch: AuthFetch): Promise<ApiEnrollment[]> {
    const res = await authFetch("/lms/enrollments/me");
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiEnrollment[];
  },

  async submitAttempt(
    authFetch: AuthFetch,
    quizId: string,
    answers: ApiAttemptAnswer[]
  ): Promise<ApiAttemptResult> {
    const res = await authFetch(`/lms/quizzes/${quizId}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiAttemptResult;
  },

  async myCertificates(authFetch: AuthFetch): Promise<ApiCertificate[]> {
    const res = await authFetch("/lms/certificates/me");
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiCertificate[];
  }
};

export interface FacilityImportItem {
  name: string;
  type: string;
  stateId: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  source: string;
  verifiedAt?: string;
}

export interface ImportResult {
  rows: number;
  accepted: number;
  rejected: number;
  acceptedIds: string[];
  rejections: { index: number; reason: string }[];
}

/**
 * Authenticated National Hospital Database management. Facility imports go
 * through the provenance-enforced pipeline (PRODUCT_MANAGER / MEDICAL_DIRECTOR).
 */
export const hospitalsAuthApi = {
  async importFacilities(
    authFetch: AuthFetch,
    items: FacilityImportItem[]
  ): Promise<ImportResult> {
    const res = await authFetch("/facilities/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ImportResult;
  }
};

// --- CRM ---
export type ContactRole =
  | "CLINICIAN"
  | "NURSE"
  | "PHARMACIST"
  | "PROCUREMENT"
  | "ADMIN"
  | "DISTRIBUTOR"
  | "OTHER";

export type InteractionType = "CALL" | "VISIT" | "MEETING" | "EMAIL" | "SEMINAR";
export type FollowUpStatus = "OPEN" | "DONE" | "CANCELLED";

export interface ApiContact {
  id: string;
  fullName: string;
  title?: string;
  role: ContactRole;
  organization?: string;
  facilityId?: string;
  phone?: string;
  email?: string;
  consentAt?: string;
  createdById: string;
  createdAt: string;
}

export interface ApiInteraction {
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

export interface ApiFollowUp {
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

export interface ContactInput {
  fullName: string;
  title?: string;
  role: ContactRole;
  organization?: string;
  facilityId?: string;
  phone?: string;
  email?: string;
  consentAt?: string;
}

export interface InteractionInput {
  contactId?: string;
  facilityId?: string;
  type: InteractionType;
  channel?: string;
  notes?: string;
  occurredAt?: string;
}

export interface FollowUpInput {
  interactionId?: string;
  contactId?: string;
  assigneeId?: string;
  dueAt?: string;
  notes?: string;
}

export interface ContactQuery {
  facilityId?: string;
  role?: ContactRole;
  q?: string;
}

/**
 * Authenticated CRM calls (staff only). Contacts, interactions, and follow-ups
 * are always live — no offline seed fallback — to avoid fabricated records.
 */
export const crmAuthApi = {
  async contacts(authFetch: AuthFetch, query: ContactQuery = {}): Promise<ApiContact[]> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await authFetch(`/crm/contacts${qs}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiContact[];
  },

  async contact(
    authFetch: AuthFetch,
    id: string
  ): Promise<ApiContact & { interactions: ApiInteraction[] }> {
    const res = await authFetch(`/crm/contacts/${id}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiContact & { interactions: ApiInteraction[] };
  },

  async createContact(authFetch: AuthFetch, input: ContactInput): Promise<ApiContact> {
    const res = await authFetch("/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiContact;
  },

  async interactions(authFetch: AuthFetch, contactId?: string): Promise<ApiInteraction[]> {
    const qs = contactId ? `?contactId=${encodeURIComponent(contactId)}` : "";
    const res = await authFetch(`/crm/interactions${qs}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiInteraction[];
  },

  async createInteraction(
    authFetch: AuthFetch,
    input: InteractionInput
  ): Promise<ApiInteraction> {
    const res = await authFetch("/crm/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiInteraction;
  },

  async followUps(
    authFetch: AuthFetch,
    query: { status?: FollowUpStatus; contactId?: string } = {}
  ): Promise<ApiFollowUp[]> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await authFetch(`/crm/follow-ups${qs}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiFollowUp[];
  },

  async createFollowUp(authFetch: AuthFetch, input: FollowUpInput): Promise<ApiFollowUp> {
    const res = await authFetch("/crm/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiFollowUp;
  },

  async updateFollowUp(
    authFetch: AuthFetch,
    id: string,
    status: FollowUpStatus
  ): Promise<ApiFollowUp> {
    const res = await authFetch(`/crm/follow-ups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiFollowUp;
  }
};

// --- Campaigns & Seminars ---
export type CampaignChannel = "EMAIL" | "SMS" | "SOCIAL" | "FIELD" | "RADIO" | "EVENT";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type SeminarStatus = "PLANNED" | "OPEN" | "FULL" | "COMPLETED" | "CANCELLED";
export type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "ATTENDED" | "CANCELLED";

export interface ApiCampaign {
  id: string;
  name: string;
  objective: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience?: string;
  startAt?: string;
  endAt?: string;
  productSlugs: string[];
  createdById: string;
  createdAt: string;
}

export interface ApiSeminar {
  id: string;
  title: string;
  summary: string;
  status: SeminarStatus;
  campaignId?: string;
  facilityId?: string;
  city?: string;
  stateId?: string;
  venue?: string;
  startAt: string;
  endAt?: string;
  capacity?: number;
  registered?: number;
  createdById: string;
  createdAt: string;
}

export interface ApiRegistration {
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

export interface CampaignInput {
  name: string;
  objective: string;
  channel: CampaignChannel;
  audience?: string;
  startAt?: string;
  endAt?: string;
  productSlugs?: string[];
}

export interface SeminarInput {
  title: string;
  summary: string;
  campaignId?: string;
  facilityId?: string;
  city?: string;
  stateId?: string;
  venue?: string;
  startAt: string;
  endAt?: string;
  capacity?: number;
}

export interface RegistrationInput {
  contactId?: string;
  fullName: string;
  email?: string;
  phone?: string;
  organization?: string;
}

/**
 * Authenticated marketing calls (campaigns, seminars, registrations). Always
 * live — no offline seed fallback, to avoid fabricated events / attendees.
 */
export const marketingAuthApi = {
  async campaigns(
    authFetch: AuthFetch,
    query: { status?: CampaignStatus; channel?: CampaignChannel; q?: string } = {}
  ): Promise<ApiCampaign[]> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await authFetch(`/marketing/campaigns${qs}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiCampaign[];
  },

  async createCampaign(authFetch: AuthFetch, input: CampaignInput): Promise<ApiCampaign> {
    const res = await authFetch("/marketing/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiCampaign;
  },

  async updateCampaign(
    authFetch: AuthFetch,
    id: string,
    status: CampaignStatus
  ): Promise<ApiCampaign> {
    const res = await authFetch(`/marketing/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiCampaign;
  },

  async seminars(
    authFetch: AuthFetch,
    query: { status?: SeminarStatus; campaignId?: string; q?: string; upcoming?: boolean } = {}
  ): Promise<ApiSeminar[]> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, String(v));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await authFetch(`/marketing/seminars${qs}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiSeminar[];
  },

  async seminar(
    authFetch: AuthFetch,
    id: string
  ): Promise<ApiSeminar & { registrations: ApiRegistration[] }> {
    const res = await authFetch(`/marketing/seminars/${id}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiSeminar & { registrations: ApiRegistration[] };
  },

  async createSeminar(authFetch: AuthFetch, input: SeminarInput): Promise<ApiSeminar> {
    const res = await authFetch("/marketing/seminars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiSeminar;
  },

  async updateSeminar(
    authFetch: AuthFetch,
    id: string,
    status: SeminarStatus
  ): Promise<ApiSeminar> {
    const res = await authFetch(`/marketing/seminars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiSeminar;
  },

  async register(
    authFetch: AuthFetch,
    seminarId: string,
    input: RegistrationInput
  ): Promise<ApiRegistration> {
    const res = await authFetch(`/marketing/seminars/${seminarId}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiRegistration;
  },

  async updateRegistration(
    authFetch: AuthFetch,
    id: string,
    status: RegistrationStatus
  ): Promise<ApiRegistration> {
    const res = await authFetch(`/marketing/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiRegistration;
  }
};

// --- Sales Intelligence (analytics) ---
export interface AnalyticsOverview {
  generatedAt: string;
  crm: {
    totalContacts: number;
    contactsByRole: Record<string, number>;
    totalInteractions: number;
    interactionsByType: Record<string, number>;
    interactionsLast30Days: number;
    followUps: { open: number; done: number; cancelled: number };
  };
  marketing: {
    totalCampaigns: number;
    campaignsByStatus: Record<string, number>;
    totalSeminars: number;
    seminarsByStatus: Record<string, number>;
    upcomingSeminars: number;
    totalRegistrations: number;
  };
  network: {
    totalFacilities: number;
    facilitiesByZone: Record<string, number>;
    facilitiesByType: Record<string, number>;
  };
}

export const analyticsAuthApi = {
  async overview(authFetch: AuthFetch): Promise<AnalyticsOverview> {
    const res = await authFetch("/analytics/overview");
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as AnalyticsOverview;
  }
};

// --- Training of Trainers (TOT) ---
export type TrainerStatus =
  | "NOMINATED"
  | "IN_TRAINING"
  | "CERTIFIED"
  | "DECLINED"
  | "SUSPENDED";

export interface ApiTrainer {
  id: string;
  fullName: string;
  userId?: string;
  contactId?: string;
  organization?: string;
  email?: string;
  specialty?: string;
  courseId?: string;
  status: TrainerStatus;
  certifiedAt?: string;
  certificateSerial?: string;
  createdById: string;
  createdAt: string;
}

export interface ApiTrainerAssessment {
  id: string;
  trainerId: string;
  competency: string;
  score: number;
  assessorId?: string;
  notes?: string;
  createdAt: string;
}

export interface TrainerInput {
  fullName: string;
  contactId?: string;
  userId?: string;
  organization?: string;
  email?: string;
  specialty?: string;
  courseId?: string;
}

export interface AssessmentInput {
  competency: string;
  score: number;
  notes?: string;
}

export const totAuthApi = {
  async trainers(
    authFetch: AuthFetch,
    query: { status?: TrainerStatus; q?: string } = {}
  ): Promise<ApiTrainer[]> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await authFetch(`/tot/trainers${qs}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiTrainer[];
  },

  async trainer(
    authFetch: AuthFetch,
    id: string
  ): Promise<ApiTrainer & { assessments: ApiTrainerAssessment[] }> {
    const res = await authFetch(`/tot/trainers/${id}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiTrainer & { assessments: ApiTrainerAssessment[] };
  },

  async createTrainer(authFetch: AuthFetch, input: TrainerInput): Promise<ApiTrainer> {
    const res = await authFetch("/tot/trainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiTrainer;
  },

  async updateTrainer(
    authFetch: AuthFetch,
    id: string,
    status: TrainerStatus
  ): Promise<ApiTrainer> {
    const res = await authFetch(`/tot/trainers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiTrainer;
  },

  async assess(
    authFetch: AuthFetch,
    trainerId: string,
    input: AssessmentInput
  ): Promise<ApiTrainerAssessment> {
    const res = await authFetch(`/tot/trainers/${trainerId}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as ApiTrainerAssessment;
  }
};

// --- AI Coach (grounded retrieval over verified corpus, EN/FR) ---

export type CoachLang = "en" | "fr";

export interface CoachCitation {
  index: number;
  kind: "product" | "research" | "course";
  heading: string;
  excerpt: string;
  label: string;
  ref?: string;
  lang: "en" | "fr" | "unknown";
}

export interface CoachAnswer {
  grounded: boolean;
  answer: string;
  citations: CoachCitation[];
  notes?: string[];
  meta: { corpusSize: number; lang: CoachLang };
}

export const coachAuthApi = {
  async ask(authFetch: AuthFetch, question: string, lang: CoachLang): Promise<CoachAnswer> {
    const res = await authFetch("/coach/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lang })
    });
    if (!res.ok) await readError(res);
    return (await res.json()) as CoachAnswer;
  },

  async suggestions(authFetch: AuthFetch, lang: CoachLang): Promise<string[]> {
    const res = await authFetch(`/coach/suggestions?lang=${lang}`);
    if (!res.ok) await readError(res);
    const { data } = await res.json();
    return data as string[];
  }
};

// --- Account registration & admin approval ---------------------------------

export interface RegisterInput {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  requestedRoles: string[];
  locale?: "en" | "fr";
}

export interface PendingUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  roles: string[];
  status: string;
  requestedRoles: string[];
  createdAt?: string;
  approvedAt?: string;
}

/** Public self-registration — creates a PENDING account for admin approval. */
export async function registerAccount(input: RegisterInput): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Registration failed (${res.status})`);
  }
  return (await res.json()) as { message: string };
}

export const adminUsersApi = {
  async list(authFetch: AuthFetch, status?: string): Promise<PendingUser[]> {
    const qs = status ? `?status=${status}` : "";
    const res = await authFetch(`/auth/users${qs}`);
    if (!res.ok) await readError(res);
    return (await res.json()) as PendingUser[];
  },
  async approve(authFetch: AuthFetch, id: string, roles?: string[]): Promise<PendingUser> {
    const res = await authFetch(`/auth/users/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roles ? { roles } : {})
    });
    if (!res.ok) await readError(res);
    return (await res.json()) as PendingUser;
  },
  async reject(authFetch: AuthFetch, id: string): Promise<PendingUser> {
    const res = await authFetch(`/auth/users/${id}/reject`, { method: "POST" });
    if (!res.ok) await readError(res);
    return (await res.json()) as PendingUser;
  }
};
