import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const CACHE_VERSION_KEY = "gnz_cache_version";
const CACHE_VERSION = "2026-07-01-public-hardening";

// Keep cache cleanup bounded to version changes instead of deleting every cache on every visit.
if ("serviceWorker" in navigator && "caches" in window) {
  const previousVersion = localStorage.getItem(CACHE_VERSION_KEY);
  if (previousVersion !== CACHE_VERSION) {
    caches.keys()
      .then((names) => Promise.all(names.map((name) => caches.delete(name))))
      .finally(() => localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION))
      .catch(() => {});
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
