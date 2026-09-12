import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";

const routes = {
  "/a-propos": {
    description: "Découvrez l’univers de GaspardNZ, styliste parisien spécialisé dans l’habillage premium, les mariages, les galas et le conseil en image.",
  },
  "/services": {
    description: "Découvrez les services GaspardNZ à Paris : stylisme mariage homme, habillage événementiel, conseil en image masculin et accompagnement personnalisé.",
  },
  "/styliste-mariage-homme-paris": {
    description: "Styliste mariage homme à Paris : GaspardNZ vous accompagne pour composer, coordonner et finaliser votre allure de la mairie au jour J. Rendez-vous en ligne.",
  },
  "/conseil-image-homme-paris": {
    description: "Conseil en image homme à Paris avec GaspardNZ : clarifiez votre style, vos coupes, couleurs, matières et associations pour construire une allure cohérente.",
  },
  "/lookbook": {
    description: "Découvrez le lookbook GaspardNZ : inspirations de style, silhouettes premium et idées de tenues pour mariages, galas et événements à Paris.",
  },
  "/contact": {
    description: "Contactez GaspardNZ à Paris pour un rendez-vous de stylisme, conseil en image, mariage, gala ou accompagnement d’habillage premium.",
  },
  "/galerie": {
    description: "Explorez la galerie GaspardNZ : looks, costumes, détails de style et inspirations d’élégance masculine pour mariages, galas et événements.",
  },
  "/videos": {
    description: "Retrouvez les vidéos GaspardNZ autour du style masculin, des mariages, des galas, des événements et de l’univers premium de la marque.",
  },
  "/partenaires": {
    description: "Découvrez les partenaires et collaborations GaspardNZ autour du mariage, du style masculin et de l’événementiel à Paris.",
  },
  "/style-du-mois": {
    description: "Découvrez le Style du Mois GaspardNZ : pièces, détails et associations sélectionnés pour comprendre et construire une allure masculine cohérente.",
  },
  "/actualites": {
    description: "Suivez les actualités GaspardNZ : inspirations de style masculin, événements, voyages, nouveautés et contenus autour de l’élégance à Paris.",
  },
};

const escapeAttr = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const replaceMeta = (html, selector, content) => {
  const safe = escapeAttr(content);
  const attr = selector.kind === "name" ? "name" : "property";
  const key = selector.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*>`, "i");
  const replacement = `<meta ${attr}="${selector.value}" content="${safe}" />`;
  return re.test(html) ? html.replace(re, replacement) : html.replace("</head>", `  ${replacement}\n</head>`);
};

let updated = 0;
for (const [route, meta] of Object.entries(routes)) {
  const file = join(dist, route.slice(1), "index.html");
  if (!existsSync(file)) continue;

  let html = readFileSync(file, "utf8");
  html = replaceMeta(html, { kind: "name", value: "description" }, meta.description);
  html = replaceMeta(html, { kind: "property", value: "og:description" }, meta.description);
  html = replaceMeta(html, { kind: "name", value: "twitter:description" }, meta.description);
  writeFileSync(file, html);
  updated += 1;
}

console.log(`SEO meta post-process complete: ${updated} static route(s) updated.`);
