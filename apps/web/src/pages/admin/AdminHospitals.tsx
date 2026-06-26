import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CheckCircle2, Loader2, LogOut, Plus, Trash2, Upload, XCircle } from "lucide-react";
import { useAuth } from "../../lib/auth";
import {
  hospitalsApi,
  hospitalsAuthApi,
  type ApiState,
  type ApiZone,
  type FacilityImportItem,
  type ImportResult
} from "../../lib/api";

const facilityTypes: { value: string; label: string }[] = [
  { value: "TEACHING_HOSPITAL", label: "Teaching Hospital" },
  { value: "FEDERAL_MEDICAL_CENTRE", label: "Federal Medical Centre" },
  { value: "GENERAL_HOSPITAL", label: "General Hospital" },
  { value: "SPECIALIST_HOSPITAL", label: "Specialist Hospital" },
  { value: "PRIMARY_HEALTH_CENTRE", label: "Primary Health Centre" },
  { value: "PRIVATE_HOSPITAL", label: "Private Hospital" },
  { value: "CLINIC", label: "Clinic" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "OTHER", label: "Other" }
];

const emptyRow: FacilityImportItem = {
  name: "",
  type: "GENERAL_HOSPITAL",
  stateId: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  source: ""
};

export default function AdminHospitals() {
  const { authFetch, user, logout } = useAuth();
  const [zones, setZones] = useState<ApiZone[]>([]);
  const [states, setStates] = useState<ApiState[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [row, setRow] = useState<FacilityImportItem>(emptyRow);
  const [queue, setQueue] = useState<FacilityImportItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hospitalsApi.zones().then(setZones).catch(() => setZones([]));
  }, []);

  useEffect(() => {
    if (!zoneId) {
      setStates([]);
      return;
    }
    hospitalsApi
      .states(zoneId)
      .then(setStates)
      .catch(() => setStates([]));
  }, [zoneId]);

  const stateName = useMemo(() => {
    const all = new Map(states.map((s) => [s.id, s.name]));
    return (id: string) => all.get(id) ?? id;
  }, [states]);

  const canAdd = row.name.trim().length >= 3 && row.stateId && row.source.trim().length >= 3;

  function addRow() {
    if (!canAdd) return;
    // Strip empty optional fields so the API receives clean payloads.
    const clean: FacilityImportItem = { ...row };
    for (const key of ["city", "address", "phone", "email", "website"] as const) {
      if (!clean[key]?.trim()) delete clean[key];
    }
    setQueue((q) => [...q, clean]);
    setRow({ ...emptyRow, type: row.type });
  }

  function removeRow(index: number) {
    setQueue((q) => q.filter((_, i) => i !== index));
  }

  async function importAll() {
    if (queue.length === 0) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await hospitalsAuthApi.importFacilities(authFetch, queue);
      setResult(res);
      if (res.accepted > 0) {
        // Keep only the rejected rows so the user can correct them.
        const rejectedIdx = new Set(res.rejections.map((r) => r.index));
        setQueue((q) => q.filter((_, i) => rejectedIdx.has(i)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-navy/5">
            <Building2 className="h-5 w-5 text-brand-navy" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Import hospitals</h1>
            <p className="text-sm text-slate-500">
              Signed in as {user?.fullName ?? user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/hospitals"
            className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            View database
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Only add facilities from a verifiable source (official register or institutional website).
        A source is required for every record — contact details are never fabricated.
      </p>

      {/* Add-row form */}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold text-slate-800">Add a facility</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            <span className="text-slate-500">Zone *</span>
            <select
              value={zoneId}
              onChange={(e) => {
                setZoneId(e.target.value);
                setRow((r) => ({ ...r, stateId: "" }));
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="">Select zone</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-slate-500">State *</span>
            <select
              value={row.stateId}
              onChange={(e) => setRow((r) => ({ ...r, stateId: e.target.value }))}
              disabled={!zoneId}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-50"
            >
              <option value="">{zoneId ? "Select state" : "Select a zone first"}</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Type *</span>
            <select
              value={row.type}
              onChange={(e) => setRow((r) => ({ ...r, type: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              {facilityTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm lg:col-span-2">
            <span className="text-slate-500">Name *</span>
            <input
              value={row.name}
              onChange={(e) => setRow((r) => ({ ...r, name: e.target.value }))}
              placeholder="e.g. Lagos University Teaching Hospital"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">City</span>
            <input
              value={row.city ?? ""}
              onChange={(e) => setRow((r) => ({ ...r, city: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm lg:col-span-3">
            <span className="text-slate-500">Address</span>
            <input
              value={row.address ?? ""}
              onChange={(e) => setRow((r) => ({ ...r, address: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Phone</span>
            <input
              value={row.phone ?? ""}
              onChange={(e) => setRow((r) => ({ ...r, phone: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Email</span>
            <input
              value={row.email ?? ""}
              onChange={(e) => setRow((r) => ({ ...r, email: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Website</span>
            <input
              value={row.website ?? ""}
              onChange={(e) => setRow((r) => ({ ...r, website: e.target.value }))}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm lg:col-span-3">
            <span className="text-slate-500">Source * (register name or URL)</span>
            <input
              value={row.source}
              onChange={(e) => setRow((r) => ({ ...r, source: e.target.value }))}
              placeholder="e.g. https://hfr.health.gov.ng or FMoH Health Facility Registry"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
        <button
          onClick={addRow}
          disabled={!canAdd}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add to import list
        </button>
      </section>

      {/* Queue */}
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            Import list {queue.length > 0 && `(${queue.length})`}
          </h2>
          <button
            onClick={importAll}
            disabled={queue.length === 0 || submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Import {queue.length > 0 ? queue.length : ""}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {queue.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No facilities queued. Add records above, then import.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {queue.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="font-medium text-slate-800">{f.name}</div>
                  <div className="text-xs text-slate-400">
                    {facilityTypes.find((t) => t.value === f.type)?.label} ·{" "}
                    {stateName(f.stateId)} · {f.source}
                  </div>
                </div>
                <button
                  onClick={() => removeRow(i)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Result */}
      {result && (
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> {result.accepted} accepted
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600">
              <XCircle className="h-4 w-4" /> {result.rejected} rejected
            </span>
          </div>
          {result.rejections.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {result.rejections.map((r) => (
                <li key={r.index}>
                  Row {r.index + 1}: {r.reason}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
