import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { registerAccount, type RegisterInput } from "../lib/api";

const ROLES: { key: string; label: string; hint: string }[] = [
  { key: "MARKETING", label: "Marketing", hint: "Campaigns, seminars, product messaging" },
  { key: "SALES", label: "Sales", hint: "Field sales & distributor support" },
  { key: "CUSTOMER_CARE", label: "Customer Care", hint: "Enquiries & after-sales support" },
  { key: "DISTRIBUTOR", label: "Distributor", hint: "Partner / reseller access" },
  { key: "CLINICAL", label: "Clinical", hint: "Wound-care clinical reference" },
  { key: "TRAINER", label: "Trainer", hint: "Training of Trainers (TOT)" }
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    requestedRoles: []
  });
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  function toggleRole(key: string) {
    setForm((f) => ({
      ...f,
      requestedRoles: f.requestedRoles.includes(key)
        ? f.requestedRoles.filter((r) => r !== key)
        : [...f.requestedRoles, key]
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.requestedRoles.length === 0) {
      setError("Select at least one role you need");
      return;
    }
    setBusy(true);
    try {
      const payload: RegisterInput = {
        ...form,
        email: form.email?.trim() ? form.email.trim() : undefined
      };
      const res = await registerAccount(payload);
      setDone(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-800">Request submitted</h1>
          <p className="mt-2 text-sm text-slate-600">{done}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <img src="/brand/astrobsm-icon.svg" alt="ASTROBSM" className="h-12 w-12 rounded-xl" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Create your account</h1>
            <p className="text-sm text-slate-500">Request role-based access — approved by an admin.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              id="phone"
              required
              inputMode="tel"
              placeholder="08012345678"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
                Confirm
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-slate-700">Roles you need</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ROLES.map((r) => {
                const active = form.requestedRoles.includes(r.key);
                return (
                  <button
                    type="button"
                    key={r.key}
                    onClick={() => toggleRole(r.key)}
                    aria-pressed={active}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      active
                        ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <span className="block font-semibold text-slate-800">{r.label}</span>
                    <span className="block text-xs text-slate-500">{r.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {busy ? "Submitting…" : "Request access"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-navy hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
