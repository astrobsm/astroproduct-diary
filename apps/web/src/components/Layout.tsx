import { NavLink, Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  Bot,
  Building2,
  CloudOff,
  FlaskConical,
  GraduationCap,
  Home,
  LogIn,
  LogOut,
  Megaphone,
  Package,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserCircle,
  Users
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import { useOnline, useOutboxCount } from "../lib/offline";

function SyncStatus() {
  const online = useOnline();
  const pending = useOutboxCount();
  const { t } = useI18n();
  if (online && pending === 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        online ? "bg-amber-400/20 text-amber-100" : "bg-rose-500/20 text-rose-100"
      }`}
      role="status"
    >
      {online ? <RefreshCw className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
      {online
        ? `${pending} ${t("common.pendingSync")}`
        : pending > 0
          ? `${t("common.offline")} · ${pending}`
          : t("common.offline")}
    </span>
  );
}

const nav = [
  { to: "/", label: "nav.home", icon: Home, end: true },
  { to: "/products", label: "nav.products", icon: Package },
  { to: "/research", label: "nav.research", icon: FlaskConical },
  { to: "/hospitals", label: "nav.hospitals", icon: Building2 },
  { to: "/academy", label: "nav.academy", icon: GraduationCap }
];

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasRole, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const canTrain = hasRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "TRAINER");
  const isAdmin = hasRole("ADMIN");
  const mobileNav = isAuthenticated
    ? [
        ...nav,
        { to: "/coach", label: "nav.coach", icon: Bot, end: false },
        { to: "/dashboard", label: "nav.insights", icon: BarChart3, end: false },
        { to: "/crm", label: "nav.crm", icon: Users, end: false },
        { to: "/marketing", label: "nav.events", icon: Megaphone, end: false },
        ...(canTrain ? [{ to: "/trainers", label: "nav.trainers", icon: Award, end: false }] : []),
        ...(isAdmin ? [{ to: "/admin/settings", label: "nav.settings", icon: Settings, end: false }] : []),
        { to: "/my-learning", label: "nav.learningShort", icon: UserCircle, end: false }
      ]
    : [...nav, { to: "/login", label: "nav.signin", icon: LogIn, end: false }];
  return (
    <div className="min-h-full flex flex-col">
      {/* Brand watermark — faint logo behind every page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center"
      >
        <img
          src="/brand/astrobsm-logo.svg"
          alt=""
          className="w-[min(72vw,560px)] opacity-[0.05]"
        />
      </div>
      <header className="bg-brand-navy text-white shadow-md sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl">
              <img src="/brand/astrobsm-icon.svg" alt="ASTROBSM" className="h-10 w-10" />
            </span>
            <span className="leading-tight">
              <span className="block font-bold tracking-wide">ASTROBSM Academy</span>
              <span className="block text-xs text-white/70">
                Bonnesante Medicals · Sales Intelligence
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <SyncStatus />
            <nav className="hidden sm:flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {t(label)}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/coach"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <Bot className="h-4 w-4" />
                {t("nav.coach")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <BarChart3 className="h-4 w-4" />
                {t("nav.insights")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/crm"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <Users className="h-4 w-4" />
                {t("nav.crm")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/marketing"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <Megaphone className="h-4 w-4" />
                {t("nav.events")}
              </NavLink>
            )}
            {isAuthenticated && canTrain && (
              <NavLink
                to="/trainers"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <Award className="h-4 w-4" />
                {t("nav.trainers")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/my-learning"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <UserCircle className="h-4 w-4" />
                {t("nav.learning")}
              </NavLink>
            )}
            <NavLink
              to={isAuthenticated ? "/admin/products" : "/login"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                }`
              }
            >
              <ShieldCheck className="h-4 w-4" />
              {isAuthenticated ? t("nav.admin") : t("nav.signin")}
            </NavLink>
            {isAuthenticated && isAdmin && (
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                  }`
                }
              >
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </NavLink>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/75 transition hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                {t("nav.signout")}
              </button>
            )}
            <div className="ml-1 flex overflow-hidden rounded-md border border-white/20 text-xs font-semibold">
              {(["en", "fr"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  aria-label={`Language ${l.toUpperCase()}`}
                  className={`px-2 py-1 ${
                    lang === l ? "bg-white text-brand-navy" : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden sticky bottom-0 z-20 grid border-t bg-white"
        style={{ gridTemplateColumns: `repeat(${mobileNav.length}, minmax(0, 1fr))` }}
      >
        {mobileNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 text-xs ${
                isActive ? "text-brand-navy font-semibold" : "text-slate-500"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {t(label)}
          </NavLink>
        ))}
      </nav>

      <footer className="hidden sm:block border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Bonnesante Medicals (ASTROBSM). Wound care, our passion.</span>
          <span>Educational platform · Not a substitute for professional clinical judgement.</span>
        </div>
      </footer>
    </div>
  );
}
