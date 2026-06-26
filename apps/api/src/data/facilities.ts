import type { GeoState } from "../domain/types";
import { geoStates } from "./geography";

/**
 * Verified tertiary-tier health facilities for the National Hospital Database.
 *
 * Scope & provenance policy (docs/06-security.md): this seed contains only the
 * publicly verifiable, government-established institutional tier — university
 * teaching hospitals, Federal Medical Centres, and federal specialist hospitals
 * (orthopaedic, neuropsychiatric, eye/ear, National Hospital Abuja). Their
 * existence, type and host state are matters of public record (Federal Ministry
 * of Health register + Wikipedia). Contact details (phone/email/website) are
 * deliberately omitted — they are NEVER fabricated and are only added when a
 * verified source supplies them.
 *
 * General hospitals, primary health centres, pharmacies and private hospitals
 * number in the tens of thousands and have no single authoritative open
 * register, so they are intentionally NOT bulk-seeded here. They are added
 * record-by-record through the provenance-enforced import pipeline
 * (POST /facilities/import).
 */

export type SeedFacilityType =
  | "TEACHING_HOSPITAL"
  | "FEDERAL_MEDICAL_CENTRE"
  | "SPECIALIST_HOSPITAL"
  | "GENERAL_HOSPITAL";

export interface SeedFacility {
  name: string;
  type: SeedFacilityType;
  stateId: string;
  city?: string;
  /**
   * Verification state. `true` (default) marks the government-established
   * institutional tier whose existence/type/host-state is on the Federal
   * Ministry of Health register → rendered GREEN. `false` marks records that
   * are community-listed (Wikipedia) but not independently confirmed against an
   * authoritative register → rendered AMBER until verified.
   */
  verified?: boolean;
  /** Street/area address — only ever set from a real, sourced value. */
  address?: string;
  /** Contact phone — only ever set from a real, sourced value. Never fabricated. */
  phone?: string;
  /** Per-record provenance override (defaults to the verified/unverified source). */
  source?: string;
}

export const FACILITY_SOURCE =
  "Federal Ministry of Health, Nigeria (health.gov.ng); Wikipedia — List of teaching hospitals in Nigeria (verified institutional tier)";

/** Provenance for community-listed (amber) records pending authoritative confirmation. */
export const FACILITY_SOURCE_UNVERIFIED =
  "Wikipedia — List of hospitals in Nigeria (community-listed; not independently verified)";

/** Verified date for this curated dataset (ISO-8601). */
export const FACILITY_VERIFIED_AT = "2026-06-26T00:00:00.000Z";

const TH = "TEACHING_HOSPITAL" as const;
const FMC = "FEDERAL_MEDICAL_CENTRE" as const;
const SH = "SPECIALIST_HOSPITAL" as const;
const GH = "GENERAL_HOSPITAL" as const;

export const seedFacilities: SeedFacility[] = [
  // ---- South East ----
  { name: "Federal Medical Centre, Umuahia", type: FMC, stateId: "state-abia", city: "Umuahia" },
  { name: "Abia State University Teaching Hospital, Aba", type: TH, stateId: "state-abia", city: "Aba" },
  { name: "Nnamdi Azikiwe University Teaching Hospital, Nnewi", type: TH, stateId: "state-anambra", city: "Nnewi" },
  { name: "Chukwuemeka Odumegwu Ojukwu University Teaching Hospital, Awka", type: TH, stateId: "state-anambra", city: "Awka" },
  { name: "Alex Ekwueme Federal University Teaching Hospital, Abakaliki", type: TH, stateId: "state-ebonyi", city: "Abakaliki" },
  { name: "Ebonyi State University Teaching Hospital, Abakaliki", type: TH, stateId: "state-ebonyi", city: "Abakaliki" },
  { name: "University of Nigeria Teaching Hospital, Ituku-Ozalla", type: TH, stateId: "state-enugu", city: "Enugu" },
  { name: "Enugu State University Teaching Hospital, Parklane", type: TH, stateId: "state-enugu", city: "Enugu" },
  { name: "National Orthopaedic Hospital, Enugu", type: SH, stateId: "state-enugu", city: "Enugu" },
  { name: "Federal Neuropsychiatric Hospital, Enugu", type: SH, stateId: "state-enugu", city: "Enugu" },
  { name: "Federal Medical Centre, Owerri", type: FMC, stateId: "state-imo", city: "Owerri" },
  { name: "Imo State University Teaching Hospital, Orlu", type: TH, stateId: "state-imo", city: "Orlu" },

  // ---- South South ----
  { name: "University of Uyo Teaching Hospital, Uyo", type: TH, stateId: "state-akwa-ibom", city: "Uyo" },
  { name: "Federal Medical Centre, Yenagoa", type: FMC, stateId: "state-bayelsa", city: "Yenagoa" },
  { name: "Niger Delta University Teaching Hospital, Okolobiri", type: TH, stateId: "state-bayelsa", city: "Okolobiri" },
  { name: "University of Calabar Teaching Hospital, Calabar", type: TH, stateId: "state-cross-river", city: "Calabar" },
  { name: "Federal Neuropsychiatric Hospital, Calabar", type: SH, stateId: "state-cross-river", city: "Calabar" },
  { name: "Delta State University Teaching Hospital, Oghara", type: TH, stateId: "state-delta", city: "Oghara" },
  { name: "Federal Medical Centre, Asaba", type: FMC, stateId: "state-delta", city: "Asaba" },
  { name: "University of Benin Teaching Hospital, Benin City", type: TH, stateId: "state-edo", city: "Benin City" },
  { name: "Irrua Specialist Teaching Hospital, Irrua", type: TH, stateId: "state-edo", city: "Irrua" },
  { name: "Federal Neuropsychiatric Hospital, Benin City (Uselu)", type: SH, stateId: "state-edo", city: "Benin City" },
  { name: "University of Port Harcourt Teaching Hospital", type: TH, stateId: "state-rivers", city: "Port Harcourt" },
  { name: "Rivers State University Teaching Hospital", type: TH, stateId: "state-rivers", city: "Port Harcourt" },

  // ---- North Central ----
  { name: "Benue State University Teaching Hospital, Makurdi", type: TH, stateId: "state-benue", city: "Makurdi" },
  { name: "Federal Medical Centre, Makurdi", type: FMC, stateId: "state-benue", city: "Makurdi" },
  { name: "Federal Medical Centre, Lokoja", type: FMC, stateId: "state-kogi", city: "Lokoja" },
  { name: "Federal University Lokoja Teaching Hospital", type: TH, stateId: "state-kogi", city: "Lokoja" },
  { name: "University of Ilorin Teaching Hospital, Ilorin", type: TH, stateId: "state-kwara", city: "Ilorin" },
  { name: "Federal Medical Centre, Lafia", type: FMC, stateId: "state-nasarawa", city: "Lafia" },
  { name: "Dalhatu Araf Specialist Hospital, Lafia", type: SH, stateId: "state-nasarawa", city: "Lafia" },
  { name: "Federal Medical Centre, Bida", type: FMC, stateId: "state-niger", city: "Bida" },
  { name: "Ibrahim Badamasi Babangida Specialist Hospital, Minna", type: SH, stateId: "state-niger", city: "Minna" },
  { name: "Jos University Teaching Hospital, Jos", type: TH, stateId: "state-plateau", city: "Jos" },
  { name: "Bingham University Teaching Hospital, Jos", type: TH, stateId: "state-plateau", city: "Jos" },
  { name: "University of Abuja Teaching Hospital, Gwagwalada", type: TH, stateId: "state-fct", city: "Gwagwalada" },
  { name: "National Hospital, Abuja", type: SH, stateId: "state-fct", city: "Abuja" },
  { name: "Federal Medical Centre, Jabi (Abuja)", type: FMC, stateId: "state-fct", city: "Abuja" },

  // ---- North East ----
  { name: "Federal Medical Centre, Yola", type: FMC, stateId: "state-adamawa", city: "Yola" },
  { name: "Modibbo Adama University Teaching Hospital, Yola", type: TH, stateId: "state-adamawa", city: "Yola" },
  { name: "Abubakar Tafawa Balewa University Teaching Hospital, Bauchi", type: TH, stateId: "state-bauchi", city: "Bauchi" },
  { name: "Federal Medical Centre, Azare", type: FMC, stateId: "state-bauchi", city: "Azare" },
  { name: "University of Maiduguri Teaching Hospital, Maiduguri", type: TH, stateId: "state-borno", city: "Maiduguri" },
  { name: "Federal Neuropsychiatric Hospital, Maiduguri", type: SH, stateId: "state-borno", city: "Maiduguri" },
  { name: "Federal Teaching Hospital, Gombe", type: TH, stateId: "state-gombe", city: "Gombe" },
  { name: "Federal Medical Centre, Jalingo", type: FMC, stateId: "state-taraba", city: "Jalingo" },
  { name: "Federal University Wukari Teaching Hospital", type: TH, stateId: "state-taraba", city: "Wukari" },
  { name: "Federal Medical Centre, Nguru", type: FMC, stateId: "state-yobe", city: "Nguru" },
  { name: "Federal Teaching Hospital, Gashua", type: TH, stateId: "state-yobe", city: "Gashua" },
  { name: "Yobe State University Teaching Hospital, Damaturu", type: TH, stateId: "state-yobe", city: "Damaturu" },

  // ---- North West ----
  { name: "Rasheed Shekoni Federal University Teaching Hospital, Dutse", type: TH, stateId: "state-jigawa", city: "Dutse" },
  { name: "Federal Medical Centre, Birnin Kudu", type: FMC, stateId: "state-jigawa", city: "Birnin Kudu" },
  { name: "Ahmadu Bello University Teaching Hospital, Zaria", type: TH, stateId: "state-kaduna", city: "Zaria" },
  { name: "Barau Dikko Teaching Hospital, Kaduna", type: TH, stateId: "state-kaduna", city: "Kaduna" },
  { name: "National Eye Centre, Kaduna", type: SH, stateId: "state-kaduna", city: "Kaduna" },
  { name: "National Ear Care Centre, Kaduna", type: SH, stateId: "state-kaduna", city: "Kaduna" },
  { name: "Aminu Kano Teaching Hospital, Kano", type: TH, stateId: "state-kano", city: "Kano" },
  { name: "Murtala Muhammed Specialist Hospital, Kano", type: SH, stateId: "state-kano", city: "Kano" },
  { name: "Federal Medical Centre, Katsina", type: FMC, stateId: "state-katsina", city: "Katsina" },
  { name: "Federal Medical Centre, Birnin Kebbi", type: FMC, stateId: "state-kebbi", city: "Birnin Kebbi" },
  { name: "Sir Yahaya Memorial Hospital, Birnin Kebbi", type: SH, stateId: "state-kebbi", city: "Birnin Kebbi" },
  { name: "Usmanu Danfodiyo University Teaching Hospital, Sokoto", type: TH, stateId: "state-sokoto", city: "Sokoto" },
  { name: "Federal Medical Centre, Gusau", type: FMC, stateId: "state-zamfara", city: "Gusau" },
  { name: "Yariman Bakura Specialist Hospital, Gusau", type: SH, stateId: "state-zamfara", city: "Gusau" },

  // ---- South West ----
  { name: "Ekiti State University Teaching Hospital, Ado-Ekiti", type: TH, stateId: "state-ekiti", city: "Ado-Ekiti" },
  { name: "Federal Teaching Hospital, Ido-Ekiti", type: TH, stateId: "state-ekiti", city: "Ido-Ekiti" },
  { name: "Lagos University Teaching Hospital, Idi-Araba", type: TH, stateId: "state-lagos", city: "Lagos" },
  { name: "Lagos State University Teaching Hospital, Ikeja", type: TH, stateId: "state-lagos", city: "Ikeja" },
  { name: "Federal Medical Centre, Ebute-Metta", type: FMC, stateId: "state-lagos", city: "Lagos" },
  { name: "National Orthopaedic Hospital, Igbobi", type: SH, stateId: "state-lagos", city: "Lagos" },
  { name: "Federal Neuropsychiatric Hospital, Yaba", type: SH, stateId: "state-lagos", city: "Lagos" },
  { name: "Olabisi Onabanjo University Teaching Hospital, Sagamu", type: TH, stateId: "state-ogun", city: "Sagamu" },
  { name: "Federal Medical Centre, Abeokuta", type: FMC, stateId: "state-ogun", city: "Abeokuta" },
  { name: "Federal Neuropsychiatric Hospital, Aro, Abeokuta", type: SH, stateId: "state-ogun", city: "Abeokuta" },
  { name: "Federal Medical Centre, Owo", type: FMC, stateId: "state-ondo", city: "Owo" },
  { name: "University of Medical Sciences Teaching Hospital, Ondo", type: TH, stateId: "state-ondo", city: "Ondo" },
  { name: "Obafemi Awolowo University Teaching Hospital Complex, Ile-Ife", type: TH, stateId: "state-osun", city: "Ile-Ife" },
  { name: "Ladoke Akintola University of Technology Teaching Hospital, Osogbo", type: TH, stateId: "state-osun", city: "Osogbo" },
  { name: "University College Hospital, Ibadan", type: TH, stateId: "state-oyo", city: "Ibadan" },

  // ===================================================================
  // Community-listed (AMBER / unverified). Existence is referenced on the
  // public Wikipedia "List of hospitals in Nigeria" but not independently
  // confirmed against an authoritative register. Contact details are omitted
  // (never fabricated) and these stay amber until verified via the import
  // pipeline against an official source.
  // ===================================================================

  // ---- South West ----
  { name: "Afe Babalola University Multi-System Teaching Hospital, Ado-Ekiti", type: TH, stateId: "state-ekiti", city: "Ado-Ekiti", verified: false },
  { name: "Bowen University Teaching Hospital, Ogbomoso", type: TH, stateId: "state-oyo", city: "Ogbomoso", verified: false },
  { name: "Babcock University Teaching Hospital, Ilishan-Remo", type: TH, stateId: "state-ogun", city: "Ilishan-Remo", verified: false },
  { name: "Massey Street Children's Hospital, Lagos Island", type: SH, stateId: "state-lagos", city: "Lagos", verified: false },
  { name: "Etta Atlantic Memorial Hospital, Lagos", type: GH, stateId: "state-lagos", city: "Lagos", verified: false },

  // ---- South South ----
  { name: "Igbinedion University Teaching Hospital, Okada", type: TH, stateId: "state-edo", city: "Okada", verified: false },
  { name: "Madonna University Teaching Hospital, Elele", type: TH, stateId: "state-rivers", city: "Elele", verified: false },

  // ---- South East ----
  { name: "Regions Stroke and Neuroscience Hospital, Mgbirichi", type: SH, stateId: "state-imo", city: "Mgbirichi", verified: false },

  // ---- North Central ----
  { name: "African Medical Centre of Excellence, Abuja", type: SH, stateId: "state-fct", city: "Abuja", verified: false },
  { name: "ECWA Hospital, Egbe", type: GH, stateId: "state-kogi", city: "Egbe", verified: false },
  { name: "Ahmadiyya Hospital, New Bussa", type: GH, stateId: "state-niger", city: "New Bussa", verified: false },

  // ---- North East ----
  { name: "Borno State Specialist Hospital, Maiduguri", type: SH, stateId: "state-borno", city: "Maiduguri", verified: false },
  { name: "Biu General Hospital", type: GH, stateId: "state-borno", city: "Biu", verified: false },
  { name: "Newlife Hospital, Mubi", type: GH, stateId: "state-adamawa", city: "Mubi", verified: false },
  { name: "General Hospital, Potiskum", type: GH, stateId: "state-yobe", city: "Potiskum", verified: false },
  { name: "General Hospital, Ningi", type: GH, stateId: "state-bauchi", city: "Ningi", verified: false }
];

/** Map of stateId -> GeoState for resolving zoneId during seeding. */
export const seedStateById: Map<string, GeoState> = new Map(
  geoStates.map((s) => [s.id, s])
);
