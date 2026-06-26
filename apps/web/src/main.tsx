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
// fetch dynamically imported module" error. Recover by reloading once to pull
// the fresh index.html and current chunk hashes. A session flag prevents loops.
function reloadOnceForStaleChunk() {
  const KEY = "astrobsm:chunk-reloaded";
  if (sessionStorage.getItem(KEY)) {
    sessionStorage.removeItem(KEY);
    return;
  }
  sessionStorage.setItem(KEY, "1");
  window.location.reload();
}

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadOnceForStaleChunk();
});

window.addEventListener("error", (event) => {
  const msg = String(event?.message ?? "");
  if (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Importing a module script failed")
  ) {
    reloadOnceForStaleChunk();
  }
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
