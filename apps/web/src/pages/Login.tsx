import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (isAuthenticated) return <Navigate to={from} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <img src="/brand/astrobsm-icon.svg" alt="ASTROBSM" className="h-12 w-12 rounded-xl" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">{t("login.title")}</h1>
            <p className="text-sm text-slate-500">{t("login.subtitle")}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
              Phone number or email
            </label>
            <input
              id="identifier"
              type="text"
              inputMode="text"
              autoComplete="username"
              required
              placeholder="08033328385"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              {t("login.password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {busy ? t("login.signingIn") : t("login.submit")}
          </button>
        </form>

        <div className="mt-6 border-t pt-5 text-center">
          <p className="text-sm text-slate-500">New to ASTROBSM Academy?</p>
          <Link
            to="/register"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-slate-50"
          >
            <UserPlus className="h-4 w-4" />
            Create an account
          </Link>
          <p className="mt-3 text-xs text-slate-400">
            New accounts are reviewed and approved by an administrator before access is granted.
          </p>
        </div>
      </div>
    </div>
  );
}
