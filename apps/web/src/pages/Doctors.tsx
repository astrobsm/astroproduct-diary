import { useMemo, useState } from "react";
import {
  Stethoscope,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Building2
} from "lucide-react";
import SourceBadge from "../components/SourceBadge";
import { useLoader } from "../lib/hooks";
import { loadDoctors, type DoctorView } from "../lib/source";

const specialtyLabel: Record<string, string> = {
  PLASTIC_SURGERY: "Plastic & Reconstructive Surgery",
  BURN_CARE: "Burn Care",
  GENERAL_SURGERY: "General Surgery",
  ORTHOPAEDIC_SURGERY: "Orthopaedic Surgery",
  VASCULAR_SURGERY: "Vascular Surgery",
  DERMATOLOGY: "Dermatology",
  WOUND_CARE_NURSING: "Wound-Care Nursing",
  OTHER: "Other"
};

export default function Doctors() {
  const [specialty, setSpecialty] = useState("");
  const [q, setQ] = useState("");

  const query = useMemo(() => ({ specialty, q }), [specialty, q]);

  const {
    data: doctorsData,
    loading,
    source
  } = useLoader<DoctorView[]>((signal) => loadDoctors(query, signal), [specialty, q]);
  const doctors = doctorsData ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-navy/5">
              <Stethoscope className="h-6 w-6 text-brand-navy" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                Specialist Doctors Directory
              </h1>
              <p className="text-sm text-slate-500">
                Plastic, reconstructive, burn-care, vascular and general surgeons reachable for
                appointments and wound-care protocol or seminar enquiries. Contact routes are added
                only from verifiable sources — no personal numbers are fabricated.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified — confirmed contact route
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" /> Unverified — pending confirmation
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <SourceBadge source={source} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          aria-label="Filter by specialty"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All specialties</option>
          {Object.entries(specialtyLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or hospital…"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </section>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading doctors…
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
          <Stethoscope className="mx-auto mb-2 h-6 w-6 text-slate-400" />
          No doctors match yet. The directory grows as verified specialist contacts are imported.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <div key={d.id} className="flex flex-col rounded-xl border bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-brand-blue">
                  {specialtyLabel[d.specialty] ?? d.specialty}
                </span>
                {d.verificationStatus === "UNVERIFIED" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    <AlertTriangle className="h-3 w-3" /> Unverified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-semibold text-slate-800">{d.fullName}</h2>
              {d.title && <p className="text-sm text-slate-500">{d.title}</p>}
              {d.hospitalName && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <Building2 className="h-3.5 w-3.5" /> {d.hospitalName}
                </p>
              )}
              {d.city && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {d.city}
                </p>
              )}
              <div className="mt-3 space-y-1 text-sm">
                {d.phone && (
                  <a href={`tel:${d.phone}`} className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-brand-blue" /> {d.phone}
                  </a>
                )}
                {d.email && (
                  <a href={`mailto:${d.email}`} className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-brand-blue" /> {d.email}
                  </a>
                )}
                {d.website && (
                  <a
                    href={d.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-brand-blue hover:underline"
                  >
                    <Globe2 className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1 border-t pt-3 text-xs text-slate-400">
                {d.verificationStatus === "UNVERIFIED" ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span className="truncate" title={d.source}>
                  Source: {d.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
