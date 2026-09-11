import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const site = "https://gaspardnz.style";
const dist = "dist";

const staticPages = {
  "/services": {
    eyebrow: "Paris · Mariages · Galas · Événements",
    h1: "Styliste mariage & habilleur homme à Paris",
    intro: "GaspardNZ accompagne les hommes qui veulent une allure maîtrisée pour un mariage, un gala ou un événement important. Conseil en image, habillage, coordination des tenues et accompagnement événementiel à Paris.",
    points: [
      ["Styliste mariage homme", "Construction d’une silhouette cohérente pour la mairie, la cérémonie et la soirée."],
      ["Habilleur mariage et événement", "Accompagnement autour des détails, des changements de look et des moments clés du jour J."],
      ["Conseil en image masculin", "Travail des coupes, matières, couleurs et associations selon le contexte et la morphologie."],
      ["Maître de cérémonie", "Accompagnement des temps forts avec une attention portée à la présentation et au rythme de l’événement."],
    ],
  },
  "/a-propos": {
    eyebrow: "GaspardNZ · Paris",
    h1: "L’univers GaspardNZ : style, habillage et élégance masculine",
    intro: "GaspardNZ développe un univers consacré à l’élégance masculine pour les mariages, galas et événements. L’approche associe conseil en image, composition de silhouettes et attention portée aux détails qui donnent de la cohérence à une tenue.",
    points: [
      ["Une vision du style", "Le contexte, le rôle dans l’événement et l’image recherchée guident les choix de tenue."],
      ["Mariages et événements", "Les différentes pièces sont pensées ensemble pour fonctionner du premier rendez-vous jusqu’au jour J."],
      ["Accompagnement personnalisé", "Chaque échange sert à préciser le besoin et le niveau d’accompagnement le plus adapté."],
    ],
  },
  "/lookbook": {
    eyebrow: "Inspirations · Silhouettes · Détails",
    h1: "Lookbook GaspardNZ : inspirations pour mariage, gala et événement",
    intro: "Le lookbook GaspardNZ rassemble des pistes de style pour visualiser une silhouette complète : volumes, associations, couleurs, accessoires et niveau de formalité. Il sert de point de départ avant un échange personnalisé.",
    points: [
      ["Silhouettes de mariage", "Des inspirations pour la mairie, la cérémonie et la soirée avec une attention portée à la cohérence globale."],
      ["Allure de gala", "Des références plus formelles pour travailler la présence, les matières et les détails."],
      ["Du look à votre projet", "Une inspiration devient utile lorsqu’elle est adaptée à votre morphologie, au lieu, à la saison et à votre rôle."],
    ],
  },
  "/contact": {
    eyebrow: "Rendez-vous · Paris",
    h1: "Prendre rendez-vous avec GaspardNZ",
    intro: "Vous préparez un mariage, un gala, une cérémonie ou un autre événement important ? Un premier échange permet de préciser la date, le contexte, votre rôle, vos attentes et le niveau d’accompagnement adapté.",
    points: [
      ["Préparer l’échange", "Date, type d’événement, rôle, tenues déjà disponibles et références de style permettent d’aller rapidement vers des propositions pertinentes."],
      ["Réserver un créneau", "Le calendrier en ligne permet de choisir directement un créneau disponible pour présenter votre projet."],
      ["Question rapide", "WhatsApp reste disponible pour vérifier qu’une prestation correspond bien à votre besoin avant le rendez-vous."],
    ],
  },
  "/galerie": {
    eyebrow: "Looks · Inspirations · Événements",
    h1: "Galerie GaspardNZ : looks, détails et inspirations de style",
    intro: "La galerie GaspardNZ permet d’explorer l’univers visuel de la marque et d’identifier des pistes pour un mariage, un gala ou un événement. Les images servent de références avant un accompagnement personnalisé.",
    points: [
      ["Observer les proportions", "Les coupes et les proportions participent autant à l’allure que le choix des couleurs."],
      ["Repérer les détails", "Cravate, nœud, chaussures, textures et accessoires renforcent une tenue lorsqu’ils restent cohérents avec l’ensemble."],
      ["Construire votre allure", "Les références visuelles servent de point de départ avant d’adapter les choix à la personne et au contexte."],
    ],
  },
};

const routes = {
  "/a-propos": { title: "À propos de GaspardNZ | Styliste et Habilleur à Paris", description: "Découvrez l'univers de GaspardNZ, styliste parisien spécialisé dans l'habillage premium, les mariages, les galas et le conseil en image." },
  "/services": { title: "Services GaspardNZ | Habillage Mariage, Galas et Événements", description: "Formules d'habillage premium, conseil en image, accompagnement mariage et maître de cérémonie à Paris avec GaspardNZ." },
  "/lookbook": { title: "Lookbook GaspardNZ | Inspirations Style et Habillage Premium", description: "Découvrez le lookbook GaspardNZ, les inspirations style, les silhouettes premium et les tenues pour mariages, galas et événements." },
  "/contact": { title: "Contact GaspardNZ | Rendez-vous Habillage Premium à Paris", description: "Contactez GaspardNZ pour un rendez-vous, une formule mariage, un gala ou un accompagnement d'habillage premium à Paris." },
  "/galerie": { title: "Galerie GaspardNZ | Looks, Costumes et Inspirations", description: "Explorez la galerie GaspardNZ avec des looks, costumes, détails de style et inspirations d'habillage premium." },
  "/videos": { title: "Vidéos GaspardNZ | Style, Mariage et Événements", description: "Retrouvez les vidéos GaspardNZ autour du style, des événements, des mariages et de l'univers premium de la marque." },
  "/partenaires": { title: "Partenaires GaspardNZ | Prestataires Mariage et Événement", description: "Découvrez les partenaires GaspardNZ pour organiser un mariage, un gala ou un événement avec des prestataires sélectionnés." },
  "/style-du-mois": { title: "Style du Mois GaspardNZ | Pièces et Inspirations Premium", description: "Découvrez le style du mois GaspardNZ, une sélection de pièces et d'inspirations pour composer une allure premium." },
  "/actualites": { title: "Actualités GaspardNZ | Style, Voyages et Événements", description: "Suivez les actualités de GaspardNZ, ses inspirations, ses voyages, ses événements et ses nouveautés style." },
};

const escapeAttr = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const replaceMeta = (html, selector, content) => html.replace(new RegExp(`(<meta ${selector} content=")[^"]*(" \\/>)`), `$1${escapeAttr(content)}$2`);
const replaceAlternate = (html, hreflang, href) => html.replace(new RegExp(`(<link rel="alternate" hreflang="${hreflang}" href=")[^"]*(" \\/>)`), `$1${escapeAttr(href)}$2`);

const nav = `<nav aria-label="Navigation GaspardNZ" style="display:flex;gap:18px;flex-wrap:wrap;margin-top:30px"><a href="/services">Services</a><a href="/lookbook">Lookbook</a><a href="/galerie">Galerie</a><a href="/a-propos">À propos</a><a href="/contact">Contact</a></nav>`;
const buildStaticMarkup = (page) => `
<main style="min-height:100vh;background:#0a0602;color:#f5f0e8;padding:64px 20px;font-family:Arial,sans-serif">
  <div style="max-width:1040px;margin:0 auto">
    <p style="color:#b8973e;letter-spacing:.18em;text-transform:uppercase;font-size:12px">${page.eyebrow}</p>
    <h1 style="font-size:clamp(42px,7vw,84px);line-height:1;margin:18px 0 24px">${page.h1}</h1>
    <p style="max-width:780px;line-height:1.8;color:rgba(245,240,232,.78)">${page.intro}</p>
    <section style="margin-top:44px;display:grid;gap:20px">
      ${page.points.map(([title, text]) => `<article><h2 style="font-size:28px">${title}</h2><p style="line-height:1.75;color:rgba(245,240,232,.72)">${text}</p></article>`).join("")}
    </section>
    ${nav}
    <p style="margin-top:34px"><a href="https://calendly.com/gaspardnz" data-track="booking_start">Prendre rendez-vous avec GaspardNZ</a></p>
  </div>
</main>`;

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
  html = replaceAlternate(html, "fr", canonical);
  html = replaceAlternate(html, "x-default", canonical);
  if (staticPages[path]) html = html.replace(/<div id="root"([^>]*)><\/div>/, `<div id="root"$1>${buildStaticMarkup(staticPages[path])}</div>`);
  const outputPath = join(dist, path, "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}
console.log(`Generated ${Object.keys(routes).length} static SEO route files`);
