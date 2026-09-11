import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const site = "https://gaspardnz.style";
const routes = {
  "/a-propos": "À propos de GaspardNZ | Styliste et Habilleur à Paris",
  "/services": "Services GaspardNZ | Habillage Mariage, Galas et Événements",
  "/lookbook": "Lookbook GaspardNZ | Inspirations Style et Habillage Premium",
  "/contact": "Contact GaspardNZ | Rendez-vous Habillage Premium à Paris",
  "/galerie": "Galerie GaspardNZ | Looks, Costumes et Inspirations",
  "/videos": "Vidéos GaspardNZ | Style, Mariage et Événements",
  "/partenaires": "Partenaires GaspardNZ | Prestataires Mariage et Événement",
  "/style-du-mois": "Style du Mois GaspardNZ | Pièces et Inspirations Premium",
  "/actualites": "Actualités GaspardNZ | Style, Voyages et Événements",
};

for (const [route, title] of Object.entries(routes)) {
  const file = `dist${route}/index.html`;
  assert.equal(existsSync(file), true, `built SEO page missing: ${file}`);
  const html = readFileSync(file, "utf8");
  const canonical = `${site}${route}`;
  assert.equal(html.includes(`<title>${title}</title>`), true, `${route} has wrong title`);
  assert.equal(html.includes(`<link rel="canonical" href="${canonical}" />`), true, `${route} has wrong canonical`);
  assert.equal(html.includes(`property="og:url" content="${canonical}"`), true, `${route} has wrong og:url`);
  assert.equal(html.includes(`property="og:title" content="${title}"`), true, `${route} has wrong og:title`);
  assert.equal(html.includes(`<title>GaspardNZ | Styliste Parisien`), false, `${route} fell back to root metadata`);
  assert.equal(html.includes(`<link rel="alternate" hreflang="fr" href="${canonical}" />`), true, `${route} has wrong fr hreflang`);
  assert.equal(html.includes(`<link rel="alternate" hreflang="x-default" href="${canonical}" />`), true, `${route} has wrong x-default hreflang`);
  for (const lang of ["en", "es", "zh"]) {
    assert.equal(html.includes(`hreflang="${lang}"`), false, `${route} exposes non-indexable ${lang} hreflang`);
  }

  if (route === "/services") {
    assert.equal(html.includes("Styliste mariage &amp; habilleur homme à Paris"), true, "services route is missing static H1 content");
    assert.equal(html.includes("Habilleur mariage et événement"), true, "services route is missing service intent content");
    assert.equal(html.includes("https://calendly.com/gaspardnz"), true, "services route is missing booking CTA");
  }
}

console.log(`Built SEO route validation passed (${Object.keys(routes).length} routes)`);
