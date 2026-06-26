import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload
} from "lucide-react";
import SourceBadge from "../components/SourceBadge";
import { useLoader } from "../lib/hooks";
import { useAuth } from "../lib/auth";
import {
  loadZones,
  loadFacilities,
  type ZoneView,
  type StateView,
  type FacilityView
} from "../lib/source";
import { hospitalsApi } from "../lib/api";

const facilityTypeLabel: Record<string, string> = {
  TEACHING_HOSPITAL: "Teaching Hospital",
  FEDERAL_MEDICAL_CENTRE: "Federal Medical Centre",
  GENERAL_HOSPITAL: "General Hospital",
  SPECIALIST_HOSPITAL: "Specialist Hospital",
  PRIMARY_HEALTH_CENTRE: "Primary Health Centre",
  PRIVATE_HOSPITAL: "Private Hospital",
  CLINIC: "Clinic",
  PHARMACY: "Pharmacy",
  OTHER: "Other"
};

export default function Hospitals() {
  const { hasRole } = useAuth();
  const { data: zonesData, source: zonesSource } = useLoader<ZoneView[]>(
    (signal) => loadZones(signal),
    []
  );
  const zones = zonesData ?? [];

  const [zoneId, setZoneId] = useState("");
  const [stateId, setStateId] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [states, setStates] = useState<StateView[]>([]);

  // Load states when the selected zone changes.
  useEffect(() => {
    let active = true;
    if (!zoneId) {
      setStates([]);
      setStateId("");
      return;
    }
    hospitalsApi
      .states(zoneId)
      .then((data) => active && setStates(data))
      .catch(() => active && setStates([]));
    setStateId("");
    return () => {
      active = false;
    };
  }, [zoneId]);

  const query = useMemo(
    () => ({ zoneId, stateId, type, q }),
    [zoneId, stateId, type, q]
  );

  const {
    data: facilitiesData,
    loading,
    source
  } = useLoader<FacilityView[]>(
    (signal) => loadFacilities(query, signal),
    [zoneId, stateId, type, q]
  );
  const facilities = facilitiesData ?? [];
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? "";
  const stateName = (id: string) => states.find((s) => s.id === id)?.name ?? "";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy/5">
              <Building2 className="h-6 w-6 text-brand-navy" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">National Hospital Database</h1>
              <p className="text-sm text-slate-500">
                Health facilities across the six geopolitical zones. Records are added only from
                verifiable sources — no contact details are fabricated.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR") && (
              <Link
                to="/admin/hospitals"
                className="inline-flex items-center gap-1 rounded-lg bg-brand-navy px-3 py-2 text-sm font-semibold text-white hover:bg-brand-blue"
              >
                <Upload className="h-4 w-4" /> Import
              </Link>
            )}
            <SourceBadge source={source ?? zonesSource} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          aria-label="Filter by zone"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All zones</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
        <select
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
          disabled={!zoneId}
          aria-label="Filter by state"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">{zoneId ? "All states" : "Select a zone first"}</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by facility type"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {Object.entries(facilityTypeLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name…"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </section>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading facilities…
        </div>
      ) : facilities.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
          <Globe2 className="mx-auto mb-2 h-6 w-6 text-slate-400" />
          No facilities match yet. The database grows as verified records are imported from
          official health registers.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <div key={f.id} className="flex flex-col rounded-xl border bg-white p-5">
              <span className="text-xs font-medium uppercase tracking-wide text-brand-blue">
                {facilityTypeLabel[f.type] ?? f.type}
              </span>
              <h2 className="mt-1 font-semibold text-slate-800">{f.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {[f.city, stateName(f.stateId), zoneName(f.zoneId)].filter(Boolean).join(", ")}
              </p>
              {f.address && <p className="mt-1 text-sm text-slate-500">{f.address}</p>}
              <div className="mt-3 space-y-1 text-sm">
                {f.phone && (
                  <a href={`tel:${f.phone}`} className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-brand-blue" /> {f.phone}
                  </a>
                )}
                {f.email && (
                  <a
                    href={`mailto:${f.email}`}
                    className="flex items-center gap-2 text-slate-600"
                  >
                    <Mail className="h-3.5 w-3.5 text-brand-blue" /> {f.email}
                  </a>
                )}
                {f.website && (
                  <a
                    href={f.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-brand-blue hover:underline"
                  >
                    <Globe2 className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1 border-t pt-3 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="truncate" title={f.source}>
                  Source: {f.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
