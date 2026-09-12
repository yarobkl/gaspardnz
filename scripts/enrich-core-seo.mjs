import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const routes = {
  "/": `
<section aria-labelledby="seo-home-approche" style="margin-top:48px;max-width:900px">
  <h2 id="seo-home-approche" style="font-size:32px;line-height:1.2">Stylisme homme à Paris pour les moments qui comptent</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">GaspardNZ accompagne les hommes qui souhaitent construire une allure cohérente pour un mariage, un gala, une cérémonie, une réception ou un rendez-vous important à Paris. Le travail ne consiste pas à empiler des pièces fortes, mais à relier coupe, proportions, couleurs, matières, accessoires et chaussures pour obtenir une silhouette lisible et adaptée au contexte.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Selon le projet, l’accompagnement peut partir d’une tenue déjà choisie, d’un dress code imposé, d’un besoin de plusieurs looks ou d’une garde-robe à clarifier. Le rôle du styliste est alors de simplifier les décisions, d’identifier les incohérences et de garder un fil conducteur entre votre personnalité, votre rôle et l’événement.</p>
</section>
<section aria-labelledby="seo-home-services" style="margin-top:42px;max-width:900px">
  <h2 id="seo-home-services" style="font-size:32px;line-height:1.2">Mariage, conseil en image et habillage personnalisé</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour un mariage, la préparation peut couvrir la mairie, la cérémonie, les photos, le dîner et la soirée, avec une ou plusieurs tenues selon le programme. Pour un besoin plus global, le conseil en image aide à mieux comprendre les coupes, associations et niveaux de formalité qui fonctionnent pour vous au quotidien comme lors d’un événement.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Découvrez la page <a href="/styliste-mariage-homme-paris">styliste mariage homme Paris</a>, le <a href="/conseil-image-homme-paris">conseil en image homme Paris</a>, les <a href="/services">services</a>, le <a href="/lookbook">lookbook</a> et la <a href="/galerie">galerie</a>. Pour présenter votre projet, utilisez la page <a href="/contact">contact</a> et choisissez un créneau adapté.</p>
</section>`,
  "/services": `
<section aria-labelledby="seo-services-detail" style="margin-top:48px;max-width:900px">
  <h2 id="seo-services-detail" style="font-size:32px;line-height:1.2">Des services pensés autour de votre contexte</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Un accompagnement utile commence par le contexte : type d’événement, lieu, saison, rôle, niveau de formalité, contraintes de temps et tenues déjà disponibles. Les services GaspardNZ sont pensés pour répondre à ces paramètres plutôt que pour appliquer une formule identique à chaque client.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Le stylisme mariage homme permet de construire une silhouette cohérente pour la mairie, la cérémonie ou la soirée. Le conseil en image travaille les coupes, proportions, matières, couleurs et associations. L’habillage événementiel aide à préparer les détails, accessoires et changements de tenue. Lorsque le projet le nécessite, l’accompagnement peut aussi intégrer une réflexion plus globale sur le rythme et la présentation des temps forts.</p>
</section>
<section aria-labelledby="seo-services-choix" style="margin-top:42px;max-width:900px">
  <h2 id="seo-services-choix" style="font-size:32px;line-height:1.2">Choisir le bon niveau d’accompagnement</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Certaines demandes nécessitent simplement un regard extérieur sur une tenue déjà composée. D’autres demandent plusieurs étapes : définition du style, sélection des pièces, coordination de plusieurs looks et vérification finale avant l’événement. Le premier échange sert à déterminer ce qui est réellement utile pour éviter les achats inutiles et concentrer l’effort sur les décisions qui changent l’allure.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour un mariage, consultez <a href="/styliste-mariage-homme-paris">l’accompagnement mariage homme à Paris</a>. Pour un besoin plus quotidien ou professionnel, découvrez le <a href="/conseil-image-homme-paris">conseil en image homme</a>. Le <a href="/lookbook">lookbook</a> et la <a href="/galerie">galerie</a> donnent des références visuelles avant de <a href="/contact">prendre rendez-vous</a>.</p>
</section>`,
  "/a-propos": `
<section aria-labelledby="seo-about-vision" style="margin-top:48px;max-width:900px">
  <h2 id="seo-about-vision" style="font-size:32px;line-height:1.2">Une vision de l’élégance centrée sur la cohérence</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">L’univers GaspardNZ repose sur une idée simple : une tenue fonctionne lorsque chaque détail sert l’ensemble. Une belle veste, une paire de chaussures ou un accessoire remarquable ne suffisent pas s’ils ne correspondent ni aux proportions, ni au contexte, ni à la personnalité de celui qui les porte.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Le travail de stylisme consiste donc à créer de la cohérence entre les choix. Cela passe par les volumes, les longueurs, les matières, les contrastes, la couleur, les accessoires et le niveau de formalité. Cette méthode s’applique aussi bien à un mariage qu’à un gala, une cérémonie, un rendez-vous professionnel ou une évolution plus générale de l’image personnelle.</p>
</section>
<section aria-labelledby="seo-about-method" style="margin-top:42px;max-width:900px">
  <h2 id="seo-about-method" style="font-size:32px;line-height:1.2">Un accompagnement qui part de la personne</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">L’objectif n’est pas d’imposer une esthétique unique. Le point de départ reste votre rôle, votre confort, vos références et l’image que vous souhaitez transmettre. Le stylisme sert à filtrer les options, à rendre les choix plus simples et à transformer des pièces isolées en une silhouette qui vous ressemble réellement.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour comprendre les prestations, consultez les <a href="/services">services GaspardNZ</a>. Vous pouvez également découvrir les pages <a href="/styliste-mariage-homme-paris">styliste mariage homme Paris</a> et <a href="/conseil-image-homme-paris">conseil en image homme Paris</a>, puis explorer le <a href="/lookbook">lookbook</a> avant de <a href="/contact">présenter votre projet</a>.</p>
</section>`,
  "/contact": `
<section aria-labelledby="seo-contact-prepare" style="margin-top:48px;max-width:900px">
  <h2 id="seo-contact-prepare" style="font-size:32px;line-height:1.2">Préparer votre demande avant le rendez-vous</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour obtenir un premier échange utile, préparez les informations essentielles : date, lieu, type d’événement, rôle, dress code éventuel, nombre de tenues envisagées et pièces déjà disponibles. Si vous avez des inspirations, quelques photos ou références visuelles permettent aussi de comprendre plus rapidement la direction souhaitée.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour un mariage, précisez les différents temps forts : mairie, cérémonie, photos, dîner ou soirée. Pour un conseil en image, indiquez les situations dans lesquelles vous souhaitez gagner en cohérence : quotidien, travail, rendez-vous, événements ou évolution générale du style. Ces éléments permettent d’orienter le rendez-vous vers les décisions prioritaires.</p>
</section>
<section aria-labelledby="seo-contact-next" style="margin-top:42px;max-width:900px">
  <h2 id="seo-contact-next" style="font-size:32px;line-height:1.2">Quel accompagnement choisir ?</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Si votre besoin concerne un mariage, la page <a href="/styliste-mariage-homme-paris">styliste mariage homme Paris</a> détaille la préparation des silhouettes et des différents moments du jour J. Si vous souhaitez clarifier votre style plus largement, consultez le <a href="/conseil-image-homme-paris">conseil en image homme Paris</a>. Les <a href="/services">services</a> permettent ensuite de comparer les types d’accompagnement disponibles.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Le <a href="/lookbook">lookbook</a> et la <a href="/galerie">galerie</a> peuvent également servir de point de départ avant l’échange. L’objectif du premier contact est de déterminer rapidement ce qui est pertinent pour votre situation et d’éviter une prestation plus complexe que nécessaire.</p>
</section>`,
  "/lookbook": `
<section aria-labelledby="seo-lookbook-read" style="margin-top:48px;max-width:900px">
  <h2 id="seo-lookbook-read" style="font-size:32px;line-height:1.2">Comment lire une inspiration de style</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Un lookbook n’est pas un catalogue à reproduire à l’identique. Il sert à observer ce qui donne de la cohérence à une silhouette : équilibre des volumes, longueur des pièces, niveau de contraste, association des matières, choix des chaussures et présence des accessoires. Une tenue réussie dépend toujours du contexte et de la personne qui la porte.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour un mariage ou un gala, une inspiration peut aider à déterminer le niveau de formalité, la palette de couleurs ou la place d’un accessoire fort. Pour un besoin plus quotidien, elle peut servir à comprendre quelles combinaisons sont faciles à reproduire avec votre garde-robe actuelle.</p>
</section>
<section aria-labelledby="seo-lookbook-adapt" style="margin-top:42px;max-width:900px">
  <h2 id="seo-lookbook-adapt" style="font-size:32px;line-height:1.2">Adapter une référence à votre propre silhouette</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">La même tenue ne produit pas le même résultat selon les proportions, la morphologie, la saison, le lieu et le rôle dans l’événement. Le travail de stylisme consiste donc à conserver l’idée forte d’une inspiration tout en ajustant les volumes, couleurs et détails pour obtenir une allure naturelle plutôt qu’un effet de copie.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour transformer une inspiration en projet concret, consultez les <a href="/services">services</a>, le <a href="/styliste-mariage-homme-paris">stylisme mariage homme à Paris</a> ou le <a href="/conseil-image-homme-paris">conseil en image homme</a>. Vous pouvez aussi explorer la <a href="/galerie">galerie</a> puis passer par la page <a href="/contact">contact</a>.</p>
</section>`,
  "/galerie": `
<section aria-labelledby="seo-gallery-observe" style="margin-top:48px;max-width:900px">
  <h2 id="seo-gallery-observe" style="font-size:32px;line-height:1.2">Observer les détails qui construisent une silhouette</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">La galerie GaspardNZ permet d’observer les looks dans leur ensemble et de repérer les éléments qui changent réellement la perception d’une tenue. Une longueur de veste, un tombé de pantalon, le contraste entre chemise et costume, la texture d’un accessoire ou le choix des chaussures peuvent modifier l’équilibre général sans nécessiter davantage de pièces.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour un mariage, une cérémonie ou un gala, les images aident aussi à comparer plusieurs niveaux de formalité. Elles permettent de mieux préparer un rendez-vous en identifiant ce qui vous attire, ce que vous souhaitez éviter et les détails que vous aimeriez adapter à votre propre projet.</p>
</section>
<section aria-labelledby="seo-gallery-project" style="margin-top:42px;max-width:900px">
  <h2 id="seo-gallery-project" style="font-size:32px;line-height:1.2">De la référence visuelle au projet personnel</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Une image reste une référence, pas une prescription. La bonne approche consiste à identifier l’idée qui fonctionne — couleur, proportion, matière, accessoire ou niveau de formalité — puis à l’adapter à la morphologie, au lieu, à la saison et au rôle de la personne qui la portera.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Pour aller plus loin, consultez le <a href="/lookbook">lookbook</a>, les <a href="/services">services GaspardNZ</a>, le <a href="/styliste-mariage-homme-paris">stylisme mariage homme Paris</a> ou le <a href="/conseil-image-homme-paris">conseil en image homme Paris</a>. La page <a href="/contact">contact</a> permet ensuite de présenter votre besoin et les références retenues.</p>
</section>`
};

for (const [route, block] of Object.entries(routes)) {
  const file = route === "/" ? join("dist", "index.html") : join("dist", route, "index.html");
  let html = readFileSync(file, "utf8");
  if (html.includes("data-gnz-core-seo-enriched")) continue;
  const marker = route === "/" ? '<nav aria-label="Découvrir GaspardNZ"' : '<nav aria-label="Navigation GaspardNZ"';
  html = html.replace(marker, `<div data-gnz-core-seo-enriched="1">${block}</div>${marker}`);
  writeFileSync(file, html);
}

console.log(`Enriched ${Object.keys(routes).length} core SEO routes`);
