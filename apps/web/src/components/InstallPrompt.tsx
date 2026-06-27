import { useEffect, useState } from "react";
import { Download, Plus, Share, X } from "lucide-react";
import { useI18n } from "../lib/i18n";

/** Chrome/Edge/Android fire this before showing the native install affordance. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "astrobsm:install-dismissed";

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari exposes this non-standard flag when launched from the home screen.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ masquerades as macOS but is touch-capable.
  const iPadOS = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

/**
 * Cross-platform install affordance:
 * - Android/Chrome/Edge: captures `beforeinstallprompt` and triggers the native
 *   install dialog from our own button.
 * - iOS/Safari (no `beforeinstallprompt`): shows the manual "Add to Home Screen"
 *   steps, since that's the only way to install on iOS.
 */
export default function InstallPrompt() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed — nothing to offer
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS never fires beforeinstallprompt — offer the manual path instead.
    let iosTimer: number | undefined;
    if (isIos()) {
      iosTimer = window.setTimeout(() => {
        setIosHelp(true);
        setShow(true);
      }, 1200);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    setShow(false);
    if (outcome === "accepted") localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:left-auto sm:right-4 sm:px-0"
      role="dialog"
      aria-label={t("install.title")}
    >
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-brand-navy/10 bg-white p-4 shadow-2xl">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-navy/5">
          <img src="/brand/astrobsm-icon.svg" alt="" className="h-10 w-10" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800">
            {iosHelp ? t("install.iosTitle") : t("install.title")}
          </p>
          {iosHelp ? (
            <ol className="mt-1 space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-1.5">
                <Share className="h-4 w-4 shrink-0 text-brand-blue" /> {t("install.iosStep1")}
              </li>
              <li className="flex items-center gap-1.5">
                <Plus className="h-4 w-4 shrink-0 text-brand-blue" /> {t("install.iosStep2")}
              </li>
            </ol>
          ) : (
            <p className="mt-0.5 text-sm text-slate-600">{t("install.body")}</p>
          )}
          {!iosHelp && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue"
              >
                <Download className="h-4 w-4" /> {t("install.button")}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
              >
                {t("install.dismiss")}
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("install.dismiss")}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
