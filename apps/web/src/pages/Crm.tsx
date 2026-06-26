import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Phone,
  PlusCircle,
  Users,
  XCircle
} from "lucide-react";
import { useAuth } from "../lib/auth";
import {
  crmAuthApi,
  type ApiContact,
  type ApiFollowUp,
  type ApiInteraction,
  type ContactInput,
  type ContactRole,
  type FollowUpStatus,
  type InteractionType
} from "../lib/api";

const ROLES: ContactRole[] = [
  "CLINICIAN",
  "NURSE",
  "PHARMACIST",
  "PROCUREMENT",
  "ADMIN",
  "DISTRIBUTOR",
  "OTHER"
];

const INTERACTION_TYPES: InteractionType[] = ["CALL", "VISIT", "MEETING", "EMAIL", "SEMINAR"];

const emptyContact: ContactInput = {
  fullName: "",
  title: "",
  role: "CLINICIAN",
  organization: "",
  phone: "",
  email: ""
};

function cleanContact(input: ContactInput): ContactInput {
  return {
    fullName: input.fullName.trim(),
    role: input.role,
    title: input.title?.trim() || undefined,
    organization: input.organization?.trim() || undefined,
    facilityId: input.facilityId?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    consentAt: input.consentAt
  };
}

export default function Crm() {
  const { authFetch } = useAuth();
  const [contacts, setContacts] = useState<ApiContact[]>([]);
  const [followUps, setFollowUps] = useState<ApiFollowUp[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<ApiInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<ContactInput>(emptyContact);
  const [search, setSearch] = useState("");
  const [interactionType, setInteractionType] = useState<InteractionType>("CALL");
  const [interactionNotes, setInteractionNotes] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, f] = await Promise.all([
        crmAuthApi.contacts(authFetch, search.trim() ? { q: search.trim() } : {}),
        crmAuthApi.followUps(authFetch)
      ]);
      setContacts(c);
      setFollowUps(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load CRM data");
    } finally {
      setLoading(false);
    }
  }, [authFetch, search]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!selectedId) {
      setInteractions([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const detail = await crmAuthApi.contact(authFetch, selectedId);
        if (active) setInteractions(detail.interactions);
      } catch {
        if (active) setInteractions([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [authFetch, selectedId]);

  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await crmAuthApi.createContact(authFetch, cleanContact(form));
      setForm(emptyContact);
      await reload();
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save contact");
    } finally {
      setBusy(false);
    }
  }

  async function logInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    try {
      await crmAuthApi.createInteraction(authFetch, {
        contactId: selectedId,
        type: interactionType,
        notes: interactionNotes.trim() || undefined
      });
      setInteractionNotes("");
      const detail = await crmAuthApi.contact(authFetch, selectedId);
      setInteractions(detail.interactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log interaction");
    } finally {
      setBusy(false);
    }
  }

  async function addFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    try {
      await crmAuthApi.createFollowUp(authFetch, {
        contactId: selectedId,
        notes: followUpNotes.trim() || undefined
      });
      setFollowUpNotes("");
      setFollowUps(await crmAuthApi.followUps(authFetch));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create follow-up");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: FollowUpStatus) {
    setBusy(true);
    try {
      await crmAuthApi.updateFollowUp(authFetch, id, status);
      setFollowUps(await crmAuthApi.followUps(authFetch));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update follow-up");
    } finally {
      setBusy(false);
    }
  }

  const contactName = (id?: string) =>
    contacts.find((c) => c.id === id)?.fullName ?? "—";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy/5">
            <Users className="h-6 w-6 text-brand-navy" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Relationship CRM</h1>
            <p className="text-sm text-slate-500">
              Track contacts, log interactions, and manage follow-ups. Records are live —
              no fabricated data.
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
        {/* Contacts column */}
        <section className="space-y-4">
          <form
            onSubmit={addContact}
            className="rounded-2xl border bg-white p-5 shadow-sm"
            aria-label="Add contact"
          >
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <PlusCircle className="h-4 w-4 text-brand-blue" /> New contact
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                placeholder="Title (e.g. Matron)"
                aria-label="Title"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                aria-label="Role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as ContactRole })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Organization"
                aria-label="Organization"
                value={form.organization ?? ""}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Phone"
                aria-label="Phone"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Email"
                type="email"
                aria-label="Email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={busy || !form.fullName.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Save contact
            </button>
          </form>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-700">Contacts</h2>
              <input
                className="w-40 rounded-lg border px-3 py-1.5 text-sm"
                placeholder="Search…"
                aria-label="Search contacts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : contacts.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No contacts yet.</p>
            ) : (
              <ul className="mt-3 divide-y">
                {contacts.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`flex w-full items-center justify-between gap-3 px-2 py-3 text-left text-sm hover:bg-slate-50 ${
                        selectedId === c.id ? "bg-brand-blue/5" : ""
                      }`}
                    >
                      <span>
                        <span className="font-semibold text-slate-800">{c.fullName}</span>
                        {c.organization && (
                          <span className="text-slate-500"> · {c.organization}</span>
                        )}
                        <span className="block text-xs text-slate-400">{c.role}</span>
                      </span>
                      {c.phone && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Detail + follow-ups column */}
        <section className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700">
              {selected ? `Activity — ${selected.fullName}` : "Select a contact"}
            </h2>
            {selected ? (
              <>
                <form onSubmit={logInteraction} className="mt-3 space-y-2" aria-label="Log interaction">
                  <div className="flex gap-2">
                    <select
                      className="rounded-lg border px-3 py-2 text-sm"
                      aria-label="Interaction type"
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                    >
                      {INTERACTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      className="flex-1 rounded-lg border px-3 py-2 text-sm"
                      placeholder="Notes"
                      aria-label="Interaction notes"
                      value={interactionNotes}
                      onChange={(e) => setInteractionNotes(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Log
                    </button>
                  </div>
                </form>

                {interactions.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No interactions logged yet.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {interactions.map((i) => (
                      <li key={i.id} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">{i.type}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(i.occurredAt).toLocaleString()}
                          </span>
                        </div>
                        {i.notes && <p className="text-slate-600">{i.notes}</p>}
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={addFollowUp} className="mt-4 flex gap-2" aria-label="Add follow-up">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    placeholder="New follow-up note"
                    aria-label="Follow-up note"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-brand-honey px-3 py-2 text-sm font-semibold text-brand-navy disabled:opacity-50"
                  >
                    Add follow-up
                  </button>
                </form>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Choose a contact to view interactions and add follow-ups.
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700">Open follow-ups</h2>
            {followUps.filter((f) => f.status === "OPEN").length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No open follow-ups.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {followUps
                  .filter((f) => f.status === "OPEN")
                  .map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="font-semibold text-slate-700">
                          {contactName(f.contactId)}
                        </span>
                        {f.notes && <span className="block text-slate-500">{f.notes}</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Mark done"
                          onClick={() => setStatus(f.id, "DONE")}
                          disabled={busy}
                          className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          title="Cancel"
                          onClick={() => setStatus(f.id, "CANCELLED")}
                          disabled={busy}
                          className="rounded-md p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
