import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ServicesRoutePage from "./components/ServicesRoutePage.jsx";

const CACHE_VERSION_KEY = "gnz_cache_version";
const CACHE_VERSION = "2026-09-11-services-route-v1";

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

const pathname = window.location.pathname.replace(/\/$/, "") || "/";
const RootComponent = pathname === "/services" ? ServicesRoutePage : App;
const rootElement = document.getElementById("root");

// SEO route files may contain server-visible fallback content. React replaces it with
// the interactive version once JavaScript is ready.
if (pathname === "/services" && rootElement?.childNodes?.length) {
  rootElement.replaceChildren();
}

createRoot(rootElement).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>
);
