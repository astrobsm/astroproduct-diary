import type { DoctorSpecialty } from "../domain/types";

/**
 * Specialist Doctors Directory — seed dataset.
 *
 * Scope & provenance policy (docs/06-security.md): individual clinicians'
 * PERSONAL phone numbers are privacy-sensitive and almost never published on an
 * authoritative open register, so they are NEVER fabricated here. What IS a
 * matter of public record is the specialist surgical service each government
 * tertiary hospital runs (Plastic/Reconstructive & Burns Surgery, Burns & Wound
 * Care, General Surgery) and the hospital's OFFICIAL published appointment line.
 *
 * This seed therefore lists, for the verified tertiary hospitals, their
 * specialist surgery units reachable on the hospital's own official, sourced
 * line — the legitimate, published route to book an appointment or reach a
 * consultant for wound-care protocol / seminar dissemination. The `phone` and
 * `source` mirror the verified facility record exactly.
 *
 * Named individual consultants WITH their own genuinely-published contact
 * details are added record-by-record through the provenance-enforced import
 * pipeline (POST /doctors/import) — never invented.
 */

export interface SeedDoctor {
  /** Display name — a named consultant, or the hospital's specialist unit. */
  fullName: string;
  /** Role/title, e.g. "Plastic, Reconstructive & Burns Surgery Unit". */
  title?: string;
  specialty: DoctorSpecialty;
  /** Exact facility name to match against the seeded facility (sets facilityId/zoneId). */
  hospitalName: string;
  stateId: string;
  city?: string;
  /** Contact phone — only ever a real, sourced value (here: the hospital's official line). */
  phone?: string;
  email?: string;
  website?: string;
  /** Per-record provenance (defaults to DOCTOR_SOURCE). */
  source?: string;
  /** GREEN when the contact route is confirmed against the hospital's official source. */
  verified?: boolean;
}

export const DOCTOR_SOURCE =
  "Specialist surgical services of Nigeria's federal/state tertiary hospitals; contact via each hospital's official published appointment line (hospital website). Individual consultant numbers are not fabricated.";

/** Verified date for this curated dataset (ISO-8601). */
export const DOCTOR_VERIFIED_AT = "2026-06-26T00:00:00.000Z";

const PLASTIC: DoctorSpecialty = "PLASTIC_SURGERY";
const BURN: DoctorSpecialty = "BURN_CARE";
const GENERAL: DoctorSpecialty = "GENERAL_SURGERY";

const PLASTIC_TITLE = "Plastic, Reconstructive & Burns Surgery Unit";
const BURN_TITLE = "Burns & Wound Care Unit";
const GENERAL_TITLE = "Department of Surgery (General Surgery)";

/**
 * Each entry's `phone`/`source` is the host hospital's OWN verified official
 * line (see apps/api/src/data/facilities.ts). Reaching a consultant via the
 * hospital switchboard/appointment desk is the published, legitimate route.
 */
export const seedDoctors: SeedDoctor[] = [
  // --- Lagos University Teaching Hospital (LUTH) ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — LUTH", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "Lagos University Teaching Hospital, Idi-Araba", stateId: "state-lagos", city: "Lagos", phone: "08126843334", source: "Official hospital website (luth.gov.ng)", verified: true },
  { fullName: "Burns & Wound Care Unit — LUTH", title: BURN_TITLE, specialty: BURN, hospitalName: "Lagos University Teaching Hospital, Idi-Araba", stateId: "state-lagos", city: "Lagos", phone: "08126843334", source: "Official hospital website (luth.gov.ng)", verified: true },

  // --- Lagos State University Teaching Hospital (LASUTH) ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — LASUTH", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "Lagos State University Teaching Hospital, Ikeja", stateId: "state-lagos", city: "Ikeja", phone: "09091481560", source: "Official hospital website (lasuth.org.ng)", verified: true },

  // --- University College Hospital (UCH), Ibadan ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — UCH Ibadan", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "University College Hospital, Ibadan", stateId: "state-oyo", city: "Ibadan", phone: "08131733447", source: "Official hospital website (uch-ibadan.org.ng)", verified: true },
  { fullName: "Burns & Wound Care Unit — UCH Ibadan", title: BURN_TITLE, specialty: BURN, hospitalName: "University College Hospital, Ibadan", stateId: "state-oyo", city: "Ibadan", phone: "08131733447", source: "Official hospital website (uch-ibadan.org.ng)", verified: true },

  // --- National Hospital, Abuja ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — National Hospital Abuja", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "National Hospital, Abuja", stateId: "state-fct", city: "Abuja", phone: "08097520012", source: "Official hospital website (nationalhospital.gov.ng)", verified: true },
  { fullName: "Burns & Wound Care Unit — National Hospital Abuja", title: BURN_TITLE, specialty: BURN, hospitalName: "National Hospital, Abuja", stateId: "state-fct", city: "Abuja", phone: "08097520012", source: "Official hospital website (nationalhospital.gov.ng)", verified: true },

  // --- University of Benin Teaching Hospital (UBTH) ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — UBTH", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "University of Benin Teaching Hospital, Benin City", stateId: "state-edo", city: "Benin City", phone: "09133000051", source: "Official hospital website (ubth.org)", verified: true },
  { fullName: "Burns & Wound Care Unit — UBTH", title: BURN_TITLE, specialty: BURN, hospitalName: "University of Benin Teaching Hospital, Benin City", stateId: "state-edo", city: "Benin City", phone: "09133000051", source: "Official hospital website (ubth.org)", verified: true },

  // --- Obafemi Awolowo University Teaching Hospital Complex (OAUTHC) ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — OAUTHC Ile-Ife", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "Obafemi Awolowo University Teaching Hospital Complex, Ile-Ife", stateId: "state-osun", city: "Ile-Ife", phone: "08152092751", source: "Official hospital website (oauthc.gov.ng)", verified: true },

  // --- Jos University Teaching Hospital (JUTH) ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — JUTH", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "Jos University Teaching Hospital, Jos", stateId: "state-plateau", city: "Jos", phone: "08032850363", source: "Official hospital website (juth.gov.ng)", verified: true },

  // --- Aminu Kano Teaching Hospital (AKTH) ---
  { fullName: "Plastic, Reconstructive & Burns Surgery Unit — AKTH Kano", title: PLASTIC_TITLE, specialty: PLASTIC, hospitalName: "Aminu Kano Teaching Hospital, Kano", stateId: "state-kano", city: "Kano", phone: "08128929195", source: "Official hospital website (akth.gov.ng)", verified: true },

  // --- University of Abuja Teaching Hospital (UATH), Gwagwalada ---
  { fullName: "Department of Surgery — UATH Gwagwalada", title: GENERAL_TITLE, specialty: GENERAL, hospitalName: "University of Abuja Teaching Hospital, Gwagwalada", stateId: "state-fct", city: "Gwagwalada", phone: "07040045614", source: "Official hospital website (uath.gov.ng)", verified: true },

  // --- Abubakar Tafawa Balewa University Teaching Hospital (ATBUTH) ---
  { fullName: "Department of Surgery — ATBUTH Bauchi", title: GENERAL_TITLE, specialty: GENERAL, hospitalName: "Abubakar Tafawa Balewa University Teaching Hospital, Bauchi", stateId: "state-bauchi", city: "Bauchi", phone: "08168674594", source: "Official hospital website (atbuth.gov.ng)", verified: true },

  // --- University of Maiduguri Teaching Hospital (UMTH) ---
  { fullName: "Department of Surgery — UMTH Maiduguri", title: GENERAL_TITLE, specialty: GENERAL, hospitalName: "University of Maiduguri Teaching Hospital, Maiduguri", stateId: "state-borno", city: "Maiduguri", phone: "076232567", source: "Official hospital website (umth.gov.ng)", verified: true },

  // --- Federal Medical Centres (General Surgery & wound care via official line) ---
  { fullName: "Department of Surgery — FMC Lokoja", title: GENERAL_TITLE, specialty: GENERAL, hospitalName: "Federal Medical Centre, Lokoja", stateId: "state-kogi", city: "Lokoja", phone: "08050312534", source: "Official hospital website (fmclokoja.gov.ng)", verified: true },
  { fullName: "Department of Surgery — FMC Azare", title: GENERAL_TITLE, specialty: GENERAL, hospitalName: "Federal Medical Centre, Azare", stateId: "state-bauchi", city: "Azare", phone: "08036161249", source: "Official hospital website (fmcazare.gov.ng)", verified: true },
  { fullName: "Department of Surgery — FMC Jalingo", title: GENERAL_TITLE, specialty: GENERAL, hospitalName: "Federal Medical Centre, Jalingo", stateId: "state-taraba", city: "Jalingo", phone: "08100197029", source: "Official hospital website (fmcjalingo.gov.ng)", verified: true },
  { fullName: "Department of Surgery — FMC Nguru", title: GENERAL_TITLE, specialty: GENERAL, hospitalName: "Federal Medical Centre, Nguru", stateId: "state-yobe", city: "Nguru", phone: "08163309374", source: "Official hospital website (fmcnguru.gov.ng)", verified: true }
];
