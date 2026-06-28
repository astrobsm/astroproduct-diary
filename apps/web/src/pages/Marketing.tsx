import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Loader2, Megaphone, PlusCircle, Users } from "lucide-react";
import { useAuth } from "../lib/auth";
import ImageUploadField from "../components/ImageUploadField";
import {
  marketingAuthApi,
  type ApiCampaign,
  type ApiRegistration,
  type ApiSeminar,
  type CampaignChannel,
  type CampaignInput,
  type CampaignStatus,
  type RegistrationInput,
  type SeminarInput,
  type SeminarStatus
} from "../lib/api";

const CHANNELS: CampaignChannel[] = ["EMAIL", "SMS", "SOCIAL", "FIELD", "RADIO", "EVENT"];
const CAMPAIGN_NEXT: Record<CampaignStatus, CampaignStatus | null> = {
  DRAFT: "ACTIVE",
  SCHEDULED: "ACTIVE",
  ACTIVE: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null
};
const SEMINAR_NEXT: Record<SeminarStatus, SeminarStatus | null> = {
  PLANNED: "OPEN",
  OPEN: "COMPLETED",
  FULL: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null
};

const statusTone: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SCHEDULED: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OPEN: "bg-emerald-100 text-emerald-700",
  PLANNED: "bg-sky-100 text-sky-700",
  FULL: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-rose-100 text-rose-700"
};

function toIsoOrUndefined(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function Marketing() {
  const { authFetch } = useAuth();
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [seminars, setSeminars] = useState<ApiSeminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [campaignForm, setCampaignForm] = useState<{ name: string; objective: string; channel: CampaignChannel; audience: string }>({
    name: "",
    objective: "",
    channel: "FIELD",
    audience: ""
  });
  const [seminarForm, setSeminarForm] = useState<{
    title: string;
    summary: string;
    campaignId: string;
    venue: string;
    startAt: string;
    capacity: string;
    imageUrl: string;
  }>({ title: "", summary: "", campaignId: "", venue: "", startAt: "", capacity: "", imageUrl: "" });

  const [selectedSeminar, setSelectedSeminar] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<ApiRegistration[]>([]);
  const [regForm, setRegForm] = useState<{ fullName: string; organization: string; email: string }>({
    fullName: "",
    organization: "",
    email: ""
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s] = await Promise.all([
        marketingAuthApi.campaigns(authFetch),
        marketingAuthApi.seminars(authFetch)
      ]);
      setCampaigns(c);
      setSeminars(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load marketing data");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadRegistrations = useCallback(
    async (id: string) => {
      try {
        const detail = await marketingAuthApi.seminar(authFetch, id);
        setRegistrations(detail.registrations);
      } catch {
        setRegistrations([]);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    if (selectedSeminar) void loadRegistrations(selectedSeminar);
    else setRegistrations([]);
  }, [selectedSeminar, loadRegistrations]);

  async function addCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignForm.name.trim() || !campaignForm.objective.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const input: CampaignInput = {
        name: campaignForm.name.trim(),
        objective: campaignForm.objective.trim(),
        channel: campaignForm.channel,
        audience: campaignForm.audience.trim() || undefined
      };
      await marketingAuthApi.createCampaign(authFetch, input);
      setCampaignForm({ name: "", objective: "", channel: "FIELD", audience: "" });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save campaign");
    } finally {
      setBusy(false);
    }
  }

  async function advanceCampaign(c: ApiCampaign) {
    const next = CAMPAIGN_NEXT[c.status];
    if (!next) return;
    setBusy(true);
    try {
      await marketingAuthApi.updateCampaign(authFetch, c.id, next);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update campaign");
    } finally {
      setBusy(false);
    }
  }

  async function addSeminar(e: React.FormEvent) {
    e.preventDefault();
    const startAt = toIsoOrUndefined(seminarForm.startAt);
    if (!seminarForm.title.trim() || !seminarForm.summary.trim() || !startAt) {
      setError("Seminar needs a title, summary, and valid start date.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const input: SeminarInput = {
        title: seminarForm.title.trim(),
        summary: seminarForm.summary.trim(),
        campaignId: seminarForm.campaignId || undefined,
        venue: seminarForm.venue.trim() || undefined,
        imageUrl: seminarForm.imageUrl || undefined,
        startAt,
        capacity: seminarForm.capacity ? Number(seminarForm.capacity) : undefined
      };
      await marketingAuthApi.createSeminar(authFetch, input);
      setSeminarForm({ title: "", summary: "", campaignId: "", venue: "", startAt: "", capacity: "", imageUrl: "" });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save seminar");
    } finally {
      setBusy(false);
    }
  }

  async function advanceSeminar(s: ApiSeminar) {
    const next = SEMINAR_NEXT[s.status];
    if (!next) return;
    setBusy(true);
    try {
      await marketingAuthApi.updateSeminar(authFetch, s.id, next);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update seminar");
    } finally {
      setBusy(false);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSeminar || !regForm.fullName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const input: RegistrationInput = {
        fullName: regForm.fullName.trim(),
        organization: regForm.organization.trim() || undefined,
        email: regForm.email.trim() || undefined
      };
      await marketingAuthApi.register(authFetch, selectedSeminar, input);
      setRegForm({ fullName: "", organization: "", email: "" });
      await Promise.all([loadRegistrations(selectedSeminar), reload()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register attendee");
    } finally {
      setBusy(false);
    }
  }

  const selected = seminars.find((s) => s.id === selectedSeminar) ?? null;
  const campaignName = (id?: string) => campaigns.find((c) => c.id === id)?.name;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy/5">
            <Megaphone className="h-6 w-6 text-brand-navy" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Campaigns &amp; Seminars</h1>
            <p className="text-sm text-slate-500">
              Plan awareness campaigns and schedule training seminars. Attendees are real
              registrations — no fabricated data.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Campaigns */}
          <section className="space-y-4">
            <form onSubmit={addCampaign} className="rounded-2xl border bg-white p-5 shadow-sm" aria-label="New campaign">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <PlusCircle className="h-4 w-4 text-brand-blue" /> New campaign
              </h2>
              <div className="mt-3 grid gap-3">
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Campaign name"
                  aria-label="Campaign name"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Objective"
                  aria-label="Objective"
                  value={campaignForm.objective}
                  onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })}
                  required
                />
                <div className="flex gap-3">
                  <select
                    className="rounded-lg border px-3 py-2 text-sm"
                    aria-label="Channel"
                    value={campaignForm.channel}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, channel: e.target.value as CampaignChannel })
                    }
                  >
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    placeholder="Audience (optional)"
                    aria-label="Audience"
                    value={campaignForm.audience}
                    onChange={(e) => setCampaignForm({ ...campaignForm, audience: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                Save campaign
              </button>
            </form>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-700">Campaigns</h2>
              {campaigns.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No campaigns yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {campaigns.map((c) => (
                    <li key={c.id} className="rounded-lg border px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800">{c.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[c.status] ?? ""}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-500">{c.objective}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {c.channel}
                          {c.audience ? ` · ${c.audience}` : ""}
                        </span>
                        {CAMPAIGN_NEXT[c.status] && (
                          <button
                            type="button"
                            onClick={() => advanceCampaign(c)}
                            disabled={busy}
                            className="font-semibold text-brand-blue hover:underline disabled:opacity-50"
                          >
                            Mark {CAMPAIGN_NEXT[c.status]}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Seminars */}
          <section className="space-y-4">
            <form onSubmit={addSeminar} className="rounded-2xl border bg-white p-5 shadow-sm" aria-label="New seminar">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CalendarDays className="h-4 w-4 text-brand-blue" /> New seminar
              </h2>
              <div className="mt-3 grid gap-3">
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Title"
                  aria-label="Seminar title"
                  value={seminarForm.title}
                  onChange={(e) => setSeminarForm({ ...seminarForm, title: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Summary"
                  aria-label="Seminar summary"
                  value={seminarForm.summary}
                  onChange={(e) => setSeminarForm({ ...seminarForm, summary: e.target.value })}
                  required
                />
                <div className="flex gap-3">
                  <input
                    type="datetime-local"
                    className="rounded-lg border px-3 py-2 text-sm"
                    aria-label="Start date and time"
                    value={seminarForm.startAt}
                    onChange={(e) => setSeminarForm({ ...seminarForm, startAt: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    min={1}
                    className="w-28 rounded-lg border px-3 py-2 text-sm"
                    placeholder="Capacity"
                    aria-label="Capacity"
                    value={seminarForm.capacity}
                    onChange={(e) => setSeminarForm({ ...seminarForm, capacity: e.target.value })}
                  />
                </div>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Venue (optional)"
                  aria-label="Venue"
                  value={seminarForm.venue}
                  onChange={(e) => setSeminarForm({ ...seminarForm, venue: e.target.value })}
                />
                <select
                  className="rounded-lg border px-3 py-2 text-sm"
                  aria-label="Linked campaign"
                  value={seminarForm.campaignId}
                  onChange={(e) => setSeminarForm({ ...seminarForm, campaignId: e.target.value })}
                >
                  <option value="">No linked campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-600">Event flyer / photo (optional)</p>
                  <ImageUploadField
                    label={seminarForm.title || "seminar"}
                    value={seminarForm.imageUrl}
                    onChange={(v) => setSeminarForm((f) => ({ ...f, imageUrl: v }))}
                    disabled={busy}
                    kind="seminar"
                    hint="Attach a banner for the seminar or outreach. Upload from your device or paste a URL."
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                Save seminar
              </button>
            </form>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-700">Seminars</h2>
              {seminars.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No seminars yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {seminars.map((s) => (
                    <li
                      key={s.id}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        selectedSeminar === s.id ? "border-brand-blue bg-brand-blue/5" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSeminar(s.id === selectedSeminar ? null : s.id)}
                        className="flex w-full items-center justify-between gap-2 text-left"
                      >
                        <span className="font-semibold text-slate-800">{s.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[s.status] ?? ""}`}>
                          {s.status}
                        </span>
                      </button>
                      {s.imageUrl && (
                        <img
                          src={s.imageUrl}
                          alt={s.title}
                          className="mt-2 h-32 w-full rounded-lg border object-cover"
                        />
                      )}
                      <p className="text-slate-500">{s.summary}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(s.startAt).toLocaleString()}
                          {campaignName(s.campaignId) ? ` · ${campaignName(s.campaignId)}` : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {s.registered ?? 0}
                          {s.capacity ? `/${s.capacity}` : ""}
                        </span>
                      </div>
                      {SEMINAR_NEXT[s.status] && (
                        <button
                          type="button"
                          onClick={() => advanceSeminar(s)}
                          disabled={busy}
                          className="mt-1 text-xs font-semibold text-brand-blue hover:underline disabled:opacity-50"
                        >
                          Mark {SEMINAR_NEXT[s.status]}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selected && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-700">
                  Registrations — {selected.title}
                </h2>
                <form onSubmit={register} className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Register attendee">
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    placeholder="Full name"
                    aria-label="Attendee name"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    required
                  />
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    placeholder="Organization"
                    aria-label="Attendee organization"
                    value={regForm.organization}
                    onChange={(e) => setRegForm({ ...regForm, organization: e.target.value })}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Register
                  </button>
                </form>
                {registrations.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No registrations yet.</p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {registrations.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                      >
                        <span>
                          <span className="font-semibold text-slate-700">{r.fullName}</span>
                          {r.organization && <span className="text-slate-500"> · {r.organization}</span>}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {r.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
