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
  Menu as MenuIcon,
  Package,
  RefreshCw,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCircle,
  Users,
  X
} from "lucide-react";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import { useOnline, useOutboxCount } from "../lib/offline";
import InstallPrompt from "./InstallPrompt";

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

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
};

// Primary destinations shown to everyone.
const primaryNav: NavItem[] = [
  { to: "/", label: "nav.home", icon: Home, end: true },
  { to: "/products", label: "nav.products", icon: Package },
  { to: "/research", label: "nav.research", icon: FlaskConical },
  { to: "/hospitals", label: "nav.hospitals", icon: Building2 },
  { to: "/doctors", label: "nav.doctors", icon: Stethoscope },
  { to: "/academy", label: "nav.academy", icon: GraduationCap }
];

// Bottom tab bar (mobile): a small, never-cramped set of quick links. Everything
// else lives in the slide-out menu opened with the "More" tab.
const bottomNav: NavItem[] = [
  { to: "/", label: "nav.home", icon: Home, end: true },
  { to: "/products", label: "nav.products", icon: Package },
  { to: "/hospitals", label: "nav.hospitals", icon: Building2 },
  { to: "/doctors", label: "nav.doctors", icon: Stethoscope }
];

function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex shrink-0 overflow-hidden rounded-md border border-white/20 text-xs font-semibold">
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
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasRole, logout } = useAuth();
  const { t } = useI18n();
  const canTrain = hasRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "TRAINER");
  const isAdmin = hasRole("ADMIN");
  const [menuOpen, setMenuOpen] = useState(false);

  // Full menu (drawer): primary links + role-gated destinations.
  const menuNav: NavItem[] = [
    ...primaryNav,
    ...(isAuthenticated
      ? [
          { to: "/coach", label: "nav.coach", icon: Bot },
          { to: "/dashboard", label: "nav.insights", icon: BarChart3 },
          { to: "/crm", label: "nav.crm", icon: Users },
          { to: "/marketing", label: "nav.events", icon: Megaphone },
          ...(canTrain ? [{ to: "/trainers", label: "nav.trainers", icon: Award }] : []),
          { to: "/my-learning", label: "nav.learning", icon: UserCircle },
          { to: "/admin/products", label: "nav.admin", icon: ShieldCheck },
          ...(isAdmin ? [{ to: "/admin/settings", label: "nav.settings", icon: Settings }] : [])
        ]
      : [{ to: "/login", label: "nav.signin", icon: LogIn }])
  ];

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const drawerLink =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition";

  return (
    <div className="min-h-full flex flex-col">
      {/* Brand watermark — faint logo behind every page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center"
      >
        <img src="/brand/astrobsm-logo.svg" alt="" className="w-[min(72vw,560px)] opacity-[0.05]" />
      </div>

      <header
        className="bg-brand-navy text-white shadow-md sticky top-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl sm:h-10 sm:w-10">
              <img src="/brand/astrobsm-icon.svg" alt="ASTROBSM" className="h-9 w-9 sm:h-10 sm:w-10" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-bold tracking-wide">ASTROBSM Academy</span>
              <span className="hidden truncate text-xs text-white/70 sm:block">
                Bonnesante Medicals · Sales Intelligence
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <SyncStatus />
            {/* Inline primary nav appears only when there's room (xl+). */}
            <nav className="hidden items-center gap-1 xl:flex">
              {primaryNav.map(({ to, label, icon: Icon, end }) => (
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
            </nav>
            <LangToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("nav.menu")}
              aria-expanded={menuOpen}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-white/90 transition hover:bg-white/10"
            >
              <MenuIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{t("nav.menu")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out menu drawer (all breakpoints) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label={t("nav.close")}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <aside
            className="absolute right-0 top-0 flex h-full w-[min(86vw,360px)] flex-col bg-brand-navy text-white shadow-2xl"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)"
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
              <span className="flex items-center gap-2">
                <img src="/brand/astrobsm-icon.svg" alt="" className="h-8 w-8" />
                <span className="font-bold tracking-wide">ASTROBSM Academy</span>
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t("nav.close")}
                className="rounded-md p-1.5 text-white/80 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {menuNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `${drawerLink} ${
                      isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {t(label)}
                </NavLink>
              ))}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className={`${drawerLink} w-full text-left text-white/80 hover:bg-white/10`}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  {t("nav.signout")}
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>

      <InstallPrompt />

      {/* Mobile bottom nav — a compact, fixed set; "More" opens the full menu. */}
      <nav
        className="sticky bottom-0 z-20 grid grid-cols-5 border-t bg-white sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {bottomNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 text-[11px] ${
                isActive ? "text-brand-navy font-semibold" : "text-slate-500"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {t(label)}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-2 text-[11px] text-slate-500"
        >
          <MenuIcon className="h-5 w-5" />
          {t("nav.menu")}
        </button>
      </nav>

      <footer className="hidden border-t bg-white sm:block">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} Bonnesante Medicals (ASTROBSM). Wound care, our passion.
          </span>
          <span>Educational platform · Not a substitute for professional clinical judgement.</span>
        </div>
      </footer>
    </div>
  );
}
