import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { I18nProvider } from "./lib/i18n";
import "./index.css";

// After a redeploy, a client still holding the previous index.html may request
// a lazy chunk whose hashed filename no longer exists. The SPA rewrite then
// returns index.html (HTML) for that .js request, producing a MIME/"Failed to
// fetch dynamically imported module" error. The usual culprit is a stale
// service worker serving an outdated precached index.html. Recover by purging
// the service worker + caches and reloading once. A session flag prevents loops.
async function recoverFromStaleChunk() {
  const KEY = "astrobsm:chunk-reloaded";
  if (sessionStorage.getItem(KEY)) {
    // Already attempted recovery this session — don't loop endlessly.
    return;
  }
  sessionStorage.setItem(KEY, "1");
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // Best-effort cleanup; reload regardless.
  }
  // Cache-bust the document so the SPA rewrite can't hand back a stale shell.
  const url = new URL(window.location.href);
  url.searchParams.set("v", Date.now().toString());
  window.location.replace(url.toString());
}

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  void recoverFromStaleChunk();
});

window.addEventListener("error", (event) => {
  const msg = String(event?.message ?? "");
  if (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("Expected a JavaScript-or-Wasm module script")
  ) {
    void recoverFromStaleChunk();
  }
});

// Clear the one-shot recovery flag once the app has successfully booted, so a
// future redeploy is allowed to self-heal again.
window.addEventListener("load", () => {
  setTimeout(() => sessionStorage.removeItem("astrobsm:chunk-reloaded"), 5000);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
