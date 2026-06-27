import { products as localProducts } from "../data/products";
import { references as localReferences } from "../data/references";
import {
  api,
  lmsApi,
  hospitalsApi,
  doctorsApi,
  type ApiProduct,
  type ApiRef,
  type ApiCourseSummary,
  type ApiCourseDetail,
  type ApiZone,
  type ApiState,
  type ApiFacility,
  type FacilityQuery,
  type ApiDoctor,
  type DoctorQuery
} from "./api";

export interface RefView {
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  evidenceLevel: string;
}

export interface ProductView {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  summary: string;
  accent: string;
  image?: string;
  ingredients: { name: string; percent?: string; role: string }[];
  sections: { type: string; title: string; items: string[] }[];
  faqs: { question: string; answer: string }[];
  references: RefView[];
}

export type DataSource = "live" | "offline";

const accentBySlug: Record<string, string> = {
  "hera-wound-gel": "from-brand-honey/20 to-brand-gold/10",
  "wound-clex": "from-brand-sky/20 to-brand-blue/10",
  "honey-gauze": "from-brand-honey/25 to-brand-gold/10",
  "sterile-dressing-pack": "from-slate-200 to-slate-100"
};
const accentFor = (slug: string) => accentBySlug[slug] ?? "from-slate-200 to-slate-100";

// ---- Local (offline) mappers ----
function localToView(p: (typeof localProducts)[number]): ProductView {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    summary: p.summary,
    accent: p.accent,
    image: p.image,
    ingredients: p.ingredients,
    sections: p.sections,
    faqs: p.faqs,
    references: p.references
      .map((i) => localReferences[i])
      .filter(Boolean)
      .map((r) => ({
        authors: r.authors,
        title: r.title,
        journal: r.journal,
        year: r.year,
        doi: r.doi,
        evidenceLevel: r.evidenceLevel
      }))
  };
}

// ---- API mappers ----
function apiRefToView(r: ApiRef): RefView {
  return {
    authors: r.authors,
    title: r.title,
    journal: r.journal,
    year: r.year,
    doi: r.doi,
    evidenceLevel: r.evidenceLevel
  };
}

function apiToView(p: ApiProduct): ProductView {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    summary: p.summary,
    accent: accentFor(p.slug),
    image: p.image,
    ingredients: p.ingredients,
    sections: p.sections,
    faqs: p.faqs,
    references: (p.referenceDetails ?? []).map(apiRefToView)
  };
}

// ---- Public source API (API-first, offline fallback) ----
export async function loadProducts(
  signal?: AbortSignal
): Promise<{ data: ProductView[]; source: DataSource }> {
  try {
    const data = await api.products(signal);
    return { data: data.map(apiToView), source: "live" };
  } catch {
    return { data: localProducts.map(localToView), source: "offline" };
  }
}

export async function loadProduct(
  slug: string,
  signal?: AbortSignal
): Promise<{ data: ProductView | null; source: DataSource }> {
  try {
    const p = await api.product(slug, signal);
    return { data: apiToView(p), source: "live" };
  } catch {
    const local = localProducts.find((p) => p.slug === slug);
    return { data: local ? localToView(local) : null, source: "offline" };
  }
}

export async function loadResearch(
  signal?: AbortSignal
): Promise<{ data: RefView[]; source: DataSource }> {
  try {
    const data = await api.research(signal);
    return { data: data.map(apiRefToView), source: "live" };
  } catch {
    return {
      data: localReferences.map((r) => ({
        authors: r.authors,
        title: r.title,
        journal: r.journal,
        year: r.year,
        doi: r.doi,
        evidenceLevel: r.evidenceLevel
      })),
      source: "offline"
    };
  }
}

// ---- Academy (LMS) ----
// Courses are served only by the live API (no bundled seed); offline yields an
// empty catalog so the UI can show a graceful "connect to load courses" state.
export type CourseSummaryView = ApiCourseSummary;
export type CourseDetailView = ApiCourseDetail;

const courseAccentBySlug: Record<string, string> = {
  EXECUTIVE: "from-brand-navy/15 to-brand-blue/10",
  MARKETING: "from-brand-honey/20 to-brand-gold/10",
  CUSTOMER_CARE: "from-brand-sky/20 to-brand-blue/10",
  SALES: "from-brand-blue/15 to-brand-sky/10",
  DISTRIBUTOR: "from-slate-200 to-slate-100",
  CLINICAL: "from-emerald-100 to-emerald-50",
  TOT: "from-brand-gold/20 to-brand-honey/10"
};

export const courseAccentFor = (audience: string) =>
  courseAccentBySlug[audience] ?? "from-slate-200 to-slate-100";

export async function loadCourses(
  signal?: AbortSignal
): Promise<{ data: CourseSummaryView[]; source: DataSource }> {
  try {
    const data = await lmsApi.courses(signal);
    return { data, source: "live" };
  } catch {
    return { data: [], source: "offline" };
  }
}

export async function loadCourse(
  slug: string,
  signal?: AbortSignal
): Promise<{ data: CourseDetailView | null; source: DataSource }> {
  try {
    const data = await lmsApi.course(slug, signal);
    return { data, source: "live" };
  } catch {
    return { data: null, source: "offline" };
  }
}

// ---- National Hospital Database ----
// Geography (zones/states) and facilities are served by the live API. Facilities
// are never bundled — they exist only when imported from a verifiable source.
export type ZoneView = ApiZone;
export type StateView = ApiState;
export type FacilityView = ApiFacility;

export async function loadZones(
  signal?: AbortSignal
): Promise<{ data: ZoneView[]; source: DataSource }> {
  try {
    const data = await hospitalsApi.zones(signal);
    return { data, source: "live" };
  } catch {
    return { data: [], source: "offline" };
  }
}

export async function loadStates(
  zoneId?: string,
  signal?: AbortSignal
): Promise<{ data: StateView[]; source: DataSource }> {
  try {
    const data = await hospitalsApi.states(zoneId, signal);
    return { data, source: "live" };
  } catch {
    return { data: [], source: "offline" };
  }
}

export async function loadFacilities(
  query: FacilityQuery = {},
  signal?: AbortSignal
): Promise<{ data: FacilityView[]; source: DataSource }> {
  try {
    const data = await hospitalsApi.facilities(query, signal);
    return { data, source: "live" };
  } catch {
    return { data: [], source: "offline" };
  }
}

// ---- Specialist Doctors Directory ----
// Doctors are served by the live API only — never bundled offline. Contact
// details exist solely when published by a verifiable source.
export type DoctorView = ApiDoctor;

export async function loadDoctors(
  query: DoctorQuery = {},
  signal?: AbortSignal
): Promise<{ data: DoctorView[]; source: DataSource }> {
  try {
    const data = await doctorsApi.doctors(query, signal);
    return { data, source: "live" };
  } catch {
    return { data: [], source: "offline" };
  }
}
