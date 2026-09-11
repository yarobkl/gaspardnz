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
