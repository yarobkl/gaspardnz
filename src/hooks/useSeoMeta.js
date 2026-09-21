import { useEffect } from "react";
import { SITE_URL } from "../constants.js";
import { SEO_ROUTES } from "../data/seoRoutes.js";
import { APP_COPY } from "../data/appCopy.js";

// Titre, balises meta et lien canonique : recalculés à chaque changement de
// route (rechargement de page) ou de langue/contraste. FR utilise le
// contenu par route (SEO_ROUTES) ; les autres langues restent génériques
// (APP_COPY) tant qu'aucune traduction par route n'existe.
export default function useSeoMeta(lang, highContrast) {
  useEffect(() => {
    const copy = APP_COPY[lang] || APP_COPY.FR;
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const routeSeo = SEO_ROUTES[path] || SEO_ROUTES["/"];
    const seoTitle = lang === "FR" ? routeSeo.title : copy.title;
    const seoDescription = lang === "FR" ? routeSeo.description : copy.description;
    const canonicalUrl = `${SITE_URL}${routeSeo.canonicalPath === "/" ? "/" : routeSeo.canonicalPath}`;
    document.title = seoTitle;
    const meta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    meta("description", seoDescription);
    meta("og:title", seoTitle, true);
    meta("og:description", seoDescription, true);
    meta("og:type", "website", true);
    meta("og:url", canonicalUrl, true);
    meta("og:image", `${SITE_URL}/images/style-parisien.jpg`, true);
    meta("og:site_name", "GaspardNZ", true);
    meta("twitter:title", seoTitle);
    meta("twitter:description", seoDescription);
    meta("twitter:image", `${SITE_URL}/images/style-parisien.jpg`);
    meta("theme-color", highContrast ? "#fff9e6" : "#0a0602");

    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
  }, [highContrast, lang]);
}
