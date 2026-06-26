import { useCallback, useEffect, useState } from "react";
import { Award, GraduationCap, Loader2, PlusCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth";
import {
  totAuthApi,
  type ApiTrainer,
  type ApiTrainerAssessment,
  type TrainerInput,
  type TrainerStatus
} from "../lib/api";

const STATUS_NEXT: Record<TrainerStatus, TrainerStatus | null> = {
  NOMINATED: "IN_TRAINING",
  IN_TRAINING: "CERTIFIED",
  CERTIFIED: "SUSPENDED",
  SUSPENDED: "IN_TRAINING",
  DECLINED: null
};

const statusTone: Record<TrainerStatus, string> = {
  NOMINATED: "bg-sky-100 text-sky-700",
  IN_TRAINING: "bg-amber-100 text-amber-700",
  CERTIFIED: "bg-emerald-100 text-emerald-700",
  SUSPENDED: "bg-rose-100 text-rose-700",
  DECLINED: "bg-slate-200 text-slate-600"
};

export default function Tot() {
  const { authFetch } = useAuth();
  const [trainers, setTrainers] = useState<ApiTrainer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<ApiTrainerAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<{ fullName: string; organization: string; specialty: string }>({
    fullName: "",
    organization: "",
    specialty: ""
  });
  const [assessForm, setAssessForm] = useState<{ competency: string; score: string; notes: string }>({
    competency: "",
    score: "",
    notes: ""
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTrainers(await totAuthApi.trainers(authFetch));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load trainers");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadAssessments = useCallback(
    async (id: string) => {
      try {
        const detail = await totAuthApi.trainer(authFetch, id);
        setAssessments(detail.assessments);
      } catch {
        setAssessments([]);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    if (selectedId) void loadAssessments(selectedId);
    else setAssessments([]);
  }, [selectedId, loadAssessments]);

  async function addTrainer(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const input: TrainerInput = {
        fullName: form.fullName.trim(),
        organization: form.organization.trim() || undefined,
        specialty: form.specialty.trim() || undefined
      };
      const created = await totAuthApi.createTrainer(authFetch, input);
      setForm({ fullName: "", organization: "", specialty: "" });
      await reload();
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not nominate trainer");
    } finally {
      setBusy(false);
    }
  }

  async function advance(t: ApiTrainer) {
    const next = STATUS_NEXT[t.status];
    if (!next) return;
    setBusy(true);
    try {
      await totAuthApi.updateTrainer(authFetch, t.id, next);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update trainer");
    } finally {
      setBusy(false);
    }
  }

  async function addAssessment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !assessForm.competency.trim()) return;
    const score = Number(assessForm.score);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      setError("Score must be between 0 and 100.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await totAuthApi.assess(authFetch, selectedId, {
        competency: assessForm.competency.trim(),
        score,
        notes: assessForm.notes.trim() || undefined
      });
      setAssessForm({ competency: "", score: "", notes: "" });
      await loadAssessments(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record assessment");
    } finally {
      setBusy(false);
    }
  }

  const selected = trainers.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy/5">
            <GraduationCap className="h-6 w-6 text-brand-navy" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Training of Trainers</h1>
            <p className="text-sm text-slate-500">
              Nominate, assess, and certify trainers who can deliver ASTROBSM education.
              Every trainer is a real nominee.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-4">
          <form onSubmit={addTrainer} className="rounded-2xl border bg-white p-5 shadow-sm" aria-label="Nominate trainer">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <PlusCircle className="h-4 w-4 text-brand-blue" /> Nominate trainer
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Full name"
                aria-label="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Organization"
                aria-label="Organization"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Specialty"
                aria-label="Specialty"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={busy || !form.fullName.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Nominate
            </button>
          </form>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700">Trainers</h2>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : trainers.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No trainers nominated yet.</p>
            ) : (
              <ul className="mt-3 divide-y">
                {trainers.map((t) => (
                  <li key={t.id} className="py-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 ${
                        selectedId === t.id ? "bg-brand-blue/5" : ""
                      }`}
                    >
                      <span>
                        <span className="font-semibold text-slate-800">{t.fullName}</span>
                        {t.organization && <span className="text-slate-500"> · {t.organization}</span>}
                        {t.specialty && (
                          <span className="block text-xs text-slate-400">{t.specialty}</span>
                        )}
                        {t.certificateSerial && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                            <Award className="h-3 w-3" /> {t.certificateSerial}
                          </span>
                        )}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[t.status]}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </button>
                    {STATUS_NEXT[t.status] && (
                      <button
                        type="button"
                        onClick={() => advance(t)}
                        disabled={busy}
                        className="ml-2 mt-1 text-xs font-semibold text-brand-blue hover:underline disabled:opacity-50"
                      >
                        Mark {STATUS_NEXT[t.status]!.replace("_", " ")}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <ShieldCheck className="h-4 w-4 text-brand-blue" />
            {selected ? `Assessments — ${selected.fullName}` : "Select a trainer"}
          </h2>
          {selected ? (
            <>
              <form onSubmit={addAssessment} className="mt-3 grid gap-2" aria-label="Record assessment">
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    placeholder="Competency"
                    aria-label="Competency"
                    value={assessForm.competency}
                    onChange={(e) => setAssessForm({ ...assessForm, competency: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-24 rounded-lg border px-3 py-2 text-sm"
                    placeholder="Score"
                    aria-label="Score"
                    value={assessForm.score}
                    onChange={(e) => setAssessForm({ ...assessForm, score: e.target.value })}
                    required
                  />
                </div>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Notes (optional)"
                  aria-label="Assessment notes"
                  value={assessForm.notes}
                  onChange={(e) => setAssessForm({ ...assessForm, notes: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="justify-self-start rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Record assessment
                </button>
              </form>

              {assessments.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No assessments recorded yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {assessments.map((a) => (
                    <li key={a.id} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{a.competency}</span>
                        <span
                          className={`font-bold ${a.score >= 70 ? "text-emerald-600" : "text-amber-600"}`}
                        >
                          {a.score}
                        </span>
                      </div>
                      {a.notes && <p className="text-slate-500">{a.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Choose a trainer to record competency assessments and advance their certification.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
