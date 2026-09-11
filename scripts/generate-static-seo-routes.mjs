import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const site = "https://gaspardnz.style";
const dist = "dist";

const pages = {
  "/a-propos": {
    title: "À propos de GaspardNZ | Styliste et Habilleur à Paris",
    description: "Découvrez l'univers de GaspardNZ, styliste parisien spécialisé dans l'habillage premium, les mariages, les galas et le conseil en image.",
    eyebrow: "GaspardNZ · Paris",
    h1: "L’univers GaspardNZ : style, habillage et élégance masculine",
    intro: "GaspardNZ développe un univers consacré à l’élégance masculine pour les mariages, galas et événements. L’approche associe conseil en image, composition de silhouettes et attention portée aux détails qui donnent de la cohérence à une tenue.",
    points: [["Une vision du style", "Le contexte, le rôle dans l’événement et l’image recherchée guident les choix de tenue."], ["Mariages et événements", "Les différentes pièces sont pensées ensemble pour fonctionner du premier rendez-vous jusqu’au jour J."], ["Accompagnement personnalisé", "Chaque échange sert à préciser le besoin et le niveau d’accompagnement le plus adapté."]],
  },
  "/services": {
    title: "Services GaspardNZ | Habillage Mariage, Galas et Événements",
    description: "Formules d'habillage premium, conseil en image, accompagnement mariage et maître de cérémonie à Paris avec GaspardNZ.",
    eyebrow: "Paris · Mariages · Galas · Événements",
    h1: "Styliste mariage & habilleur homme à Paris",
    intro: "GaspardNZ accompagne les hommes qui veulent une allure maîtrisée pour un mariage, un gala ou un événement important. Conseil en image, habillage, coordination des tenues et accompagnement événementiel à Paris.",
    points: [["Styliste mariage homme", "Construction d’une silhouette cohérente pour la mairie, la cérémonie et la soirée."], ["Habilleur mariage et événement", "Accompagnement autour des détails, des changements de look et des moments clés du jour J."], ["Conseil en image masculin", "Travail des coupes, matières, couleurs et associations selon le contexte et la morphologie."], ["Maître de cérémonie", "Accompagnement des temps forts avec une attention portée à la présentation et au rythme de l’événement."]],
  },
  "/styliste-mariage-homme-paris": {
    title: "Styliste Mariage Homme Paris | GaspardNZ",
    description: "Styliste mariage homme à Paris : GaspardNZ vous accompagne pour composer, coordonner et finaliser votre allure de la mairie au jour J. Rendez-vous en ligne.",
    eyebrow: "Mariage · Paris · Conseil en style homme",
    h1: "Styliste mariage homme à Paris",
    intro: "Pour un mariage, une tenue ne se résume pas au costume. GaspardNZ accompagne les hommes pour construire une allure cohérente avec le lieu, la saison, le rôle et les différents temps forts du jour J.",
    points: [["Comprendre votre mariage", "Date, lieux, dress code, rôle, déroulé de la journée, photos et niveau de formalité attendu sont posés dès le premier échange."], ["Composer la silhouette", "Coupes, couleurs, matières, chemise, accessoires et chaussures sont choisis comme un ensemble cohérent plutôt que comme des achats isolés."], ["Prévoir mairie, cérémonie et soirée", "Lorsque plusieurs looks sont utiles, les transitions sont anticipées afin de conserver une continuité visuelle pendant toute la journée."], ["Sécuriser le jour J", "Selon la formule choisie, l’accompagnement peut aller jusqu’à l’habillage et à la vérification des détails avant les moments clés."], ["Pour le marié et ses proches", "Le service peut concerner le marié, un témoin, un père ou un proche qui occupe un rôle important dans le mariage."], ["Un conseil, pas une esthétique imposée", "Le stylisme sert à traduire votre personnalité dans une silhouette adaptée au mariage et à éliminer les options qui ne servent pas votre allure."]],
    faq: [["Quand prendre rendez-vous avec un styliste avant le mariage ?", "Le plus tôt possible lorsque plusieurs tenues ou temps forts sont prévus. Le premier échange sert à poser le calendrier et les décisions à prendre."], ["Peut-on prévoir plusieurs looks pour le mariage ?", "Oui. Mairie, cérémonie, dîner et soirée peuvent demander des niveaux de formalité différents tout en gardant une cohérence entre les silhouettes."], ["L’accompagnement est-il uniquement pour le marié ?", "Non. Il peut aussi concerner un témoin, un père ou un proche qui occupe un rôle important dans le mariage."]],
  },
  "/conseil-image-homme-paris": {
    title: "Conseil en Image Homme Paris | GaspardNZ",
    description: "Conseil en image homme à Paris avec GaspardNZ : clarifiez votre style, vos coupes, couleurs, matières et associations pour construire une allure cohérente.",
    eyebrow: "Conseil en image · Homme · Paris",
    h1: "Conseil en image homme à Paris",
    intro: "GaspardNZ accompagne les hommes qui souhaitent clarifier leur image et construire des silhouettes cohérentes. Le travail porte sur les coupes, les proportions, les couleurs, les matières et les associations selon votre personnalité et les contextes dans lesquels vous évoluez.",
    points: [["Clarifier votre objectif", "Identifier les situations, les attentes et les points de blocage qui rendent vos choix vestimentaires difficiles."], ["Travailler coupes et proportions", "Comprendre les volumes, longueurs et équilibres qui rendent une silhouette plus lisible selon votre morphologie et le contexte."], ["Relier couleurs et matières", "Choisir des associations qui fonctionnent ensemble au lieu d’accumuler des pièces intéressantes mais difficiles à coordonner."], ["Composer des silhouettes cohérentes", "Relier vêtements, chaussures et accessoires pour que chaque élément serve l’ensemble."], ["Adapter le niveau de formalité", "Faire évoluer votre tenue selon un rendez-vous, un dîner, un événement ou un contexte professionnel tout en gardant la même identité."], ["Rendre vos choix plus simples", "Retenir des principes utiles et reproductibles afin de décider plus facilement ce qui sert réellement votre allure."]],
    faq: [["À quoi sert un conseil en image pour homme ?", "À clarifier les choix qui renforcent votre allure : coupes, proportions, couleurs, matières, associations et niveau de formalité, en cohérence avec votre personnalité et vos contextes."], ["Faut-il changer toute sa garde-robe ?", "Non. Le premier échange peut partir de ce que vous portez déjà afin d’identifier ce qui fonctionne, ce qui crée de l’incohérence et les priorités."], ["Le conseil en image est-il réservé aux événements ?", "Non. Un événement peut être le déclencheur, mais les principes travaillés peuvent aussi aider à rendre votre image plus claire dans d’autres contextes personnels ou professionnels."], ["Que préparer avant le premier rendez-vous ?", "Vos objectifs, les situations dans lesquelles vous souhaitez mieux vous habiller, quelques tenues actuelles et, si vous en avez, des références visuelles."]],
    serviceName: "Conseil en image homme à Paris",
  },
  "/lookbook": {
    title: "Lookbook GaspardNZ | Inspirations Style et Habillage Premium",
    description: "Découvrez le lookbook GaspardNZ, les inspirations style, les silhouettes premium et les tenues pour mariages, galas et événements.",
    eyebrow: "Inspirations · Silhouettes · Détails",
    h1: "Lookbook GaspardNZ : inspirations pour mariage, gala et événement",
    intro: "Le lookbook GaspardNZ rassemble des pistes de style pour visualiser une silhouette complète : volumes, associations, couleurs, accessoires et niveau de formalité. Il sert de point de départ avant un échange personnalisé.",
    points: [["Silhouettes de mariage", "Des inspirations pour la mairie, la cérémonie et la soirée avec une attention portée à la cohérence globale."], ["Allure de gala", "Des références plus formelles pour travailler la présence, les matières et les détails."], ["Du look à votre projet", "Une inspiration devient utile lorsqu’elle est adaptée à votre morphologie, au lieu, à la saison et à votre rôle."]],
  },
  "/contact": {
    title: "Contact GaspardNZ | Rendez-vous Habillage Premium à Paris",
    description: "Contactez GaspardNZ pour un rendez-vous, une formule mariage, un gala ou un accompagnement d'habillage premium à Paris.",
    eyebrow: "Rendez-vous · Paris",
    h1: "Prendre rendez-vous avec GaspardNZ",
    intro: "Vous préparez un mariage, un gala, une cérémonie ou un autre événement important ? Un premier échange permet de préciser la date, le contexte, votre rôle, vos attentes et le niveau d’accompagnement adapté.",
    points: [["Préparer l’échange", "Date, type d’événement, rôle, tenues déjà disponibles et références de style permettent d’aller rapidement vers des propositions pertinentes."], ["Réserver un créneau", "Le calendrier en ligne permet de choisir directement un créneau disponible pour présenter votre projet."], ["Question rapide", "WhatsApp reste disponible pour vérifier qu’une prestation correspond bien à votre besoin avant le rendez-vous."]],
  },
  "/galerie": {
    title: "Galerie GaspardNZ | Looks, Costumes et Inspirations",
    description: "Explorez la galerie GaspardNZ avec des looks, costumes, détails de style et inspirations d'habillage premium.",
    eyebrow: "Looks · Inspirations · Événements",
    h1: "Galerie GaspardNZ : looks, détails et inspirations de style",
    intro: "La galerie GaspardNZ permet d’explorer l’univers visuel de la marque et d’identifier des pistes pour un mariage, un gala ou un événement. Les images servent de références avant un accompagnement personnalisé.",
    points: [["Observer les proportions", "Les coupes et les proportions participent autant à l’allure que le choix des couleurs."], ["Repérer les détails", "Cravate, nœud, chaussures, textures et accessoires renforcent une tenue lorsqu’ils restent cohérents avec l’ensemble."], ["Construire votre allure", "Les références visuelles servent de point de départ avant d’adapter les choix à la personne et au contexte."]],
  },
  "/videos": {
    title: "Vidéos GaspardNZ | Style, Mariage et Événements",
    description: "Retrouvez les vidéos GaspardNZ autour du style, des événements, des mariages et de l'univers premium de la marque.",
    eyebrow: "Vidéos · Looks · Coulisses",
    h1: "Vidéos GaspardNZ : looks, détails et inspirations en mouvement",
    intro: "La vidéo permet d’observer une tenue autrement qu’en photo : tombé des matières, proportions, mouvement, accessoires et présence générale. Les contenus GaspardNZ servent de références pour mieux visualiser une allure avant un accompagnement personnalisé.",
    points: [["Observer les silhouettes en mouvement", "Une coupe peut paraître différente lorsque l’on marche, s’assoit ou change de posture. Les vidéos aident à regarder la tenue dans des conditions plus proches d’un événement réel."], ["Comprendre le rôle des détails", "Chaussures, accessoires, revers, longueurs et contrastes prennent davantage de sens lorsqu’ils sont vus dans l’ensemble d’une silhouette."], ["Préparer votre propre projet", "Les vidéos servent d’inspiration. Le rendez-vous permet ensuite de sélectionner ce qui est pertinent pour votre morphologie, votre rôle et le contexte de l’événement."]],
  },
  "/partenaires": {
    title: "Partenaires GaspardNZ | Prestataires Mariage et Événement",
    description: "Découvrez l'approche GaspardNZ des collaborations et prestataires autour des mariages, galas et événements.",
    eyebrow: "Événement · Réseau · Expérience",
    h1: "Partenaires GaspardNZ : construire une expérience événementielle cohérente",
    intro: "Un mariage ou un événement réussi réunit souvent plusieurs métiers. L’univers GaspardNZ peut s’inscrire aux côtés d’autres intervenants, avec un objectif simple : préserver une cohérence entre l’image, le déroulé et l’expérience globale.",
    points: [["Des métiers complémentaires", "Photographie, beauté, décoration, lieux, animation ou autres prestations événementielles peuvent intervenir autour d’un même projet sans se substituer au travail de stylisme."], ["Une cohérence autour du client", "Lorsque plusieurs intervenants participent au même événement, les informations utiles, le niveau de formalité et le calendrier doivent rester cohérents."], ["Préparer les bons échanges", "Le premier rendez-vous GaspardNZ aide à identifier les contraintes de votre projet et les points qui doivent être coordonnés avec les autres prestataires."]],
  },
  "/style-du-mois": {
    title: "Style du Mois GaspardNZ | Pièces et Inspirations Premium",
    description: "Découvrez le style du mois GaspardNZ, une sélection éditoriale pour comprendre les pièces, détails et associations qui construisent une allure.",
    eyebrow: "Sélection · Détails · Inspiration",
    h1: "Style du mois GaspardNZ : une lecture concrète de l’élégance masculine",
    intro: "Le Style du Mois met en avant une direction visuelle, une pièce ou une association afin d’expliquer ce qui crée l’équilibre d’une silhouette. L’objectif n’est pas de reproduire un look à l’identique, mais de comprendre pourquoi il fonctionne.",
    points: [["Une silhouette à observer", "Couleurs, volumes et niveau de formalité sont analysés ensemble afin de montrer comment une tenue gagne en cohérence."], ["Les détails qui changent l’ensemble", "Chaussures, accessoires, textures et finitions peuvent renforcer une silhouette à condition de rester au service de l’ensemble."], ["Adapter plutôt que copier", "Une inspiration devient pertinente lorsqu’elle est adaptée à la morphologie, au contexte, à la saison et à la personnalité de celui qui la porte."]],
  },
  "/actualites": {
    title: "Actualités GaspardNZ | Style, Voyages et Événements",
    description: "Suivez les actualités GaspardNZ : nouveautés de l'univers, inspirations de style, événements et contenus autour de l'élégance masculine.",
    eyebrow: "Journal · Style · Événements",
    h1: "Actualités GaspardNZ : style, événements et inspirations",
    intro: "Les actualités GaspardNZ réunissent les nouveautés de l’univers, les inspirations de style, les événements et les contenus qui permettent de suivre l’évolution de la marque sans perdre de vue l’essentiel : l’allure, le contexte et les détails.",
    points: [["Nouveautés de l’univers", "Cette page permet de retrouver les publications et mises à jour liées à GaspardNZ, aux projets en cours et aux temps forts présentés sur le site."], ["Inspirations à décrypter", "Une actualité peut aussi servir de référence pour comprendre une silhouette, une association de couleurs, une matière ou un niveau de formalité adapté à un événement."], ["Passer de l’idée au rendez-vous", "Si une publication correspond à votre mariage, gala ou événement, le rendez-vous permet de traduire l’inspiration en choix adaptés à votre situation."]],
  },
};

const escapeAttr = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const replaceMeta = (html, selector, content) => html.replace(new RegExp(`(<meta ${selector} content=")[^"]*(" \\/>)`), `$1${escapeAttr(content)}$2`);
const replaceAlternate = (html, hreflang, href) => html.replace(new RegExp(`(<link rel="alternate" hreflang="${hreflang}" href=")[^"]*(" \\/>)`), `$1${escapeAttr(href)}$2`);
const nav = `<nav aria-label="Navigation GaspardNZ" style="display:flex;gap:18px;flex-wrap:wrap;margin-top:30px"><a href="/styliste-mariage-homme-paris">Styliste mariage homme Paris</a><a href="/conseil-image-homme-paris">Conseil en image homme Paris</a><a href="/services">Services</a><a href="/lookbook">Lookbook</a><a href="/galerie">Galerie</a><a href="/a-propos">À propos</a><a href="/contact">Contact</a></nav>`;
const buildStaticMarkup = (page) => `<main style="min-height:100vh;background:#0a0602;color:#f5f0e8;padding:64px 20px;font-family:Arial,sans-serif"><h1 style="font-size:clamp(42px,7vw,84px);line-height:1;margin:18px 0 24px">${page.h1}</h1><p style="color:#b8973e;letter-spacing:.18em;text-transform:uppercase;font-size:12px">${page.eyebrow}</p><p style="max-width:780px;line-height:1.8;color:rgba(245,240,232,.78)">${page.intro}</p><section style="margin-top:44px;display:grid;gap:20px">${page.points.map(([title, text]) => `<article><h2 style="font-size:28px">${title}</h2><p style="line-height:1.75;color:rgba(245,240,232,.72)">${text}</p></article>`).join("")}</section>${nav}<p style="margin-top:34px"><a href="https://calendly.com/gaspardnz" data-track="booking_start">Prendre rendez-vous avec GaspardNZ</a></p></main>`;
const buildSchema = (page, path) => {
  const graph = [];
  if (page.faq?.length) graph.push({ "@type": "FAQPage", mainEntity: page.faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) });
  if (page.serviceName) graph.push({ "@type": "Service", name: page.serviceName, serviceType: "Conseil en image masculin", provider: { "@id": `${site}/#business` }, areaServed: { "@type": "City", name: "Paris" }, url: `${site}${path}` });
  return graph.length ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>` : "";
};

const source = readFileSync(join(dist, "index.html"), "utf8");
for (const [path, page] of Object.entries(pages)) {
  const canonical = `${site}${path}`;
  let html = source.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(page.title)}</title>`).replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);
  html = replaceMeta(html, 'name="description"', page.description);
  html = replaceMeta(html, 'property="og:title"', page.title);
  html = replaceMeta(html, 'property="og:description"', page.description);
  html = replaceMeta(html, 'property="og:url"', canonical);
  html = replaceMeta(html, 'name="twitter:title"', page.title);
  html = replaceMeta(html, 'name="twitter:description"', page.description);
  html = replaceAlternate(html, "fr", canonical);
  html = replaceAlternate(html, "x-default", canonical);
  const schema = buildSchema(page, path);
  if (schema) html = html.replace("</head>", `${schema}\n</head>`);
  html = html.replace(/<div id="root"([^>]*)>[\s\S]*?<\/div>/, `<div id="root"$1>${buildStaticMarkup(page)}</div>`);
  const outputPath = join(dist, path, "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}
console.log(`Generated ${Object.keys(pages).length} static SEO route files`);
