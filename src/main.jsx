import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ServicesRoutePage from "./components/ServicesRoutePage.jsx";
import SeoRoutePage from "./components/SeoRoutePage.jsx";
import SecondarySeoRoutePage from "./components/SecondarySeoRoutePage.jsx";
import MarriageSeoPage from "./components/MarriageSeoPage.jsx";
import ImageConsultingSeoPage from "./components/ImageConsultingSeoPage.jsx";
import PublicSeoEnvironment from "./components/PublicSeoEnvironment.jsx";

const CACHE_VERSION_KEY = "gnz_cache_version";
const CACHE_VERSION = "2026-09-11-seo-analytics-v1";

// Retire l'ancien service worker encore installé sur certains téléphones :
// il interceptait les vidéos et Safari (iPhone) les refusait alors. Le site
// n'en utilise plus. Si la page en cours était encore contrôlée par lui, on
// recharge une seule fois pour que la vidéo se charge directement.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .then((results) => {
      if (results.some(Boolean) && navigator.serviceWorker.controller) window.location.reload();
    })
    .catch(() => {});
}

if ("serviceWorker" in navigator && "caches" in window) {
  const previousVersion = localStorage.getItem(CACHE_VERSION_KEY);
  if (previousVersion !== CACHE_VERSION) {
    caches.keys()
      .then((names) => Promise.all(names.map((name) => caches.delete(name))))
      .finally(() => localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION))
      .catch(() => {});
  }
}

// Un onglet resté ouvert (très courant sur iPhone) garde l'ancienne version
// du site après une mise en ligne. Quand le visiteur revient sur l'onglet,
// on compare la version chargée à celle du serveur et on recharge si elle a
// changé, sauf s'il a un formulaire ou une fenêtre ouverte.
const INDEX_SCRIPT_RE = /\/assets\/index-[\w-]+\.js/;
const loadedIndexScript = [...document.scripts].map((s) => s.src.match(INDEX_SCRIPT_RE)?.[0]).find(Boolean);
if (loadedIndexScript) {
  let lastCheck = 0;
  const checkForNewVersion = async () => {
    if (document.hidden || Date.now() - lastCheck < 60_000) return;
    lastCheck = Date.now();
    try {
      const html = await (await fetch("/", { cache: "no-store" })).text();
      const liveIndexScript = html.match(INDEX_SCRIPT_RE)?.[0];
      const busy = document.activeElement?.matches?.("input, textarea, select") || document.querySelector('[role="dialog"][aria-modal="true"]');
      if (liveIndexScript && liveIndexScript !== loadedIndexScript && !busy) window.location.reload();
    } catch {}
  };
  document.addEventListener("visibilitychange", checkForNewVersion);
  window.addEventListener("focus", checkForNewVersion);
  window.addEventListener("pageshow", (event) => { if (event.persisted) checkForNewVersion(); });
}

const pathname = window.location.pathname.replace(/\/$/, "") || "/";
const SEO_ROUTE_PATHS = new Set(["/a-propos", "/lookbook", "/contact", "/galerie"]);
const SECONDARY_SEO_ROUTE_PATHS = new Set(["/actualites", "/videos", "/partenaires", "/style-du-mois"]);
const isDedicatedSeoRoute =
  pathname === "/services" ||
  pathname === "/styliste-mariage-homme-paris" ||
  pathname === "/conseil-image-homme-paris" ||
  SEO_ROUTE_PATHS.has(pathname) ||
  SECONDARY_SEO_ROUTE_PATHS.has(pathname);

let RootComponent = App;
if (pathname === "/services") RootComponent = ServicesRoutePage;
else if (pathname === "/styliste-mariage-homme-paris") RootComponent = MarriageSeoPage;
else if (pathname === "/conseil-image-homme-paris") RootComponent = ImageConsultingSeoPage;
else if (SEO_ROUTE_PATHS.has(pathname)) RootComponent = SeoRoutePage;
else if (SECONDARY_SEO_ROUTE_PATHS.has(pathname)) RootComponent = SecondarySeoRoutePage;

const rootElement = document.getElementById("root");
if (rootElement?.childNodes?.length) rootElement.replaceChildren();

createRoot(rootElement).render(
  <StrictMode>
    {isDedicatedSeoRoute ? (
      <PublicSeoEnvironment>
        <RootComponent />
      </PublicSeoEnvironment>
    ) : (
      <RootComponent />
    )}
  </StrictMode>,
);
