import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const site = "https://gaspardnz.style";
const dist = "dist";

const routes = {
  "/a-propos": {
    title: "À propos de GaspardNZ | Styliste et Habilleur à Paris",
    description: "Découvrez l'univers de GaspardNZ, styliste parisien spécialisé dans l'habillage premium, les mariages, les galas et le conseil en image.",
  },
  "/services": {
    title: "Services GaspardNZ | Habillage Mariage, Galas et Événements",
    description: "Formules d'habillage premium, conseil en image, accompagnement mariage et maître de cérémonie à Paris avec GaspardNZ.",
  },
  "/lookbook": {
    title: "Lookbook GaspardNZ | Inspirations Style et Habillage Premium",
    description: "Découvrez le lookbook GaspardNZ, les inspirations style, les silhouettes premium et les tenues pour mariages, galas et événements.",
  },
  "/contact": {
    title: "Contact GaspardNZ | Rendez-vous Habillage Premium à Paris",
    description: "Contactez GaspardNZ pour un rendez-vous, une formule mariage, un gala ou un accompagnement d'habillage premium à Paris.",
  },
  "/galerie": {
    title: "Galerie GaspardNZ | Looks, Costumes et Inspirations",
    description: "Explorez la galerie GaspardNZ avec des looks, costumes, détails de style et inspirations d'habillage premium.",
  },
  "/videos": {
    title: "Vidéos GaspardNZ | Style, Mariage et Événements",
    description: "Retrouvez les vidéos GaspardNZ autour du style, des événements, des mariages et de l'univers premium de la marque.",
  },
  "/partenaires": {
    title: "Partenaires GaspardNZ | Prestataires Mariage et Événement",
    description: "Découvrez les partenaires GaspardNZ pour organiser un mariage, un gala ou un événement avec des prestataires sélectionnés.",
  },
  "/style-du-mois": {
    title: "Style du Mois GaspardNZ | Pièces et Inspirations Premium",
    description: "Découvrez le style du mois GaspardNZ, une sélection de pièces et d'inspirations pour composer une allure premium.",
  },
  "/actualites": {
    title: "Actualités GaspardNZ | Style, Voyages et Événements",
    description: "Suivez les actualités de GaspardNZ, ses inspirations, ses voyages, ses événements et ses nouveautés style.",
  },
};

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const replaceMeta = (html, selector, content) => {
  const escaped = escapeAttr(content);
  return html.replace(new RegExp(`(<meta ${selector} content=")[^"]*(" \\/>)`), `$1${escaped}$2`);
};

const source = readFileSync(join(dist, "index.html"), "utf8");

for (const [path, seo] of Object.entries(routes)) {
  const canonical = `${site}${path}`;
  let html = source
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(seo.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);

  html = replaceMeta(html, 'name="description"', seo.description);
  html = replaceMeta(html, 'property="og:title"', seo.title);
  html = replaceMeta(html, 'property="og:description"', seo.description);
  html = replaceMeta(html, 'property="og:url"', canonical);
  html = replaceMeta(html, 'name="twitter:title"', seo.title);
  html = replaceMeta(html, 'name="twitter:description"', seo.description);

  const outputPath = join(dist, path, "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}

console.log(`Generated ${Object.keys(routes).length} static SEO route files`);
