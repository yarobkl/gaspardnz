import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const routes = {
  "/styliste-mariage-homme-paris": `
<section aria-labelledby="seo-mariage-approche" style="margin-top:52px;max-width:900px">
  <h2 id="seo-mariage-approche" style="font-size:32px;line-height:1.2">Un accompagnement pensé pour les vrais enjeux d’un mariage</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Choisir une tenue de mariage demande plus que trouver un beau costume. Il faut tenir compte du lieu, de la saison, du dress code, de la lumière, du rythme de la journée et de votre rôle. Un styliste mariage homme à Paris aide à relier ces paramètres pour construire une silhouette lisible, élégante et cohérente du premier essayage jusqu’au jour J.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">L’objectif est aussi d’éviter les incohérences fréquentes : veste trop formelle pour le lieu, accessoires qui surchargent l’ensemble, chaussures mal coordonnées, couleurs qui fonctionnent séparément mais pas ensemble, ou changements de tenue sans continuité visuelle. Le travail de GaspardNZ consiste à simplifier ces décisions et à garder un fil conducteur entre la mairie, la cérémonie, les photos, le dîner et la soirée.</p>
</section>
<section aria-labelledby="seo-mariage-pour-qui" style="margin-top:44px;max-width:900px">
  <h2 id="seo-mariage-pour-qui" style="font-size:32px;line-height:1.2">Pour le marié, les témoins et les proches</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">L’accompagnement peut concerner le marié, mais aussi un témoin, un père, un frère ou un proche qui occupe une place importante dans l’événement. Le niveau de formalité et les choix de style sont adaptés au rôle de chacun afin de créer une harmonie sans uniformiser toutes les silhouettes.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Selon le projet, le rendez-vous peut servir à valider une tenue déjà choisie, construire plusieurs looks, revoir les accessoires ou organiser la transition entre plusieurs moments de la journée. La priorité reste toujours la même : vous aider à être à l’aise, cohérent avec l’événement et reconnaissable dans votre propre style.</p>
</section>
<section aria-labelledby="seo-mariage-rdv" style="margin-top:44px;max-width:900px">
  <h2 id="seo-mariage-rdv" style="font-size:32px;line-height:1.2">Comment préparer votre premier rendez-vous</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Préparez la date, les lieux, le dress code, vos inspirations, les éventuelles tenues déjà achetées et les différents temps forts prévus. Ces informations permettent d’identifier rapidement les priorités et d’éviter des achats inutiles. Vous pouvez également consulter les <a href="/services">services GaspardNZ</a>, le <a href="/lookbook">lookbook</a> et la <a href="/galerie">galerie</a> avant de <a href="/contact">prendre rendez-vous</a>.</p>
</section>`,
  "/conseil-image-homme-paris": `
<section aria-labelledby="seo-image-objectif" style="margin-top:52px;max-width:900px">
  <h2 id="seo-image-objectif" style="font-size:32px;line-height:1.2">Construire une image cohérente, pas un personnage</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Le conseil en image homme à Paris ne consiste pas à imposer un style standard. Il sert à comprendre ce qui fonctionne réellement pour vous : proportions, coupes, couleurs, matières, chaussures, accessoires et niveau de formalité. L’objectif est de construire une image plus claire et plus cohérente avec votre personnalité, votre activité et les situations dans lesquelles vous évoluez.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Une garde-robe peut contenir de belles pièces sans former de bonnes tenues. Le travail consiste donc à repérer les associations faciles, les volumes qui équilibrent votre silhouette et les achats qui complètent réellement l’existant. Cette méthode aide à réduire les hésitations, les doublons et les vêtements peu portés.</p>
</section>
<section aria-labelledby="seo-image-situations" style="margin-top:44px;max-width:900px">
  <h2 id="seo-image-situations" style="font-size:32px;line-height:1.2">Un accompagnement utile au quotidien comme pour les événements</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Le conseil peut répondre à plusieurs besoins : préparer un mariage ou un gala, faire évoluer son image professionnelle, gagner en assurance lors de rendez-vous importants, apprendre à mieux associer ses vêtements ou simplement clarifier un style devenu difficile à définir. Les recommandations sont adaptées au contexte et au niveau d’accompagnement recherché.</p>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Le travail peut partir de votre vestiaire actuel. Il n’est donc pas nécessaire de tout remplacer. Identifier les bonnes bases, les pièces manquantes et les associations efficaces permet souvent d’améliorer rapidement la cohérence générale sans multiplier les achats.</p>
</section>
<section aria-labelledby="seo-image-rdv" style="margin-top:44px;max-width:900px">
  <h2 id="seo-image-rdv" style="font-size:32px;line-height:1.2">Préparer votre rendez-vous conseil en image</h2>
  <p style="line-height:1.8;color:rgba(245,240,232,.74)">Avant le rendez-vous, notez les situations dans lesquelles vous souhaitez mieux vous habiller, les difficultés que vous rencontrez et quelques références visuelles qui vous parlent. Vous pouvez aussi préparer des photos de tenues actuelles. Pour aller plus loin, découvrez les <a href="/services">services GaspardNZ</a>, les inspirations du <a href="/lookbook">lookbook</a> puis utilisez la page <a href="/contact">contact</a> pour présenter votre besoin.</p>
</section>`
};

for (const [route, block] of Object.entries(routes)) {
  const file = join("dist", route, "index.html");
  let html = readFileSync(file, "utf8");
  if (html.includes("data-gnz-acquisition-enriched")) continue;
  const marker = '<nav aria-label="Navigation GaspardNZ"';
  html = html.replace(marker, `<div data-gnz-acquisition-enriched="1">${block}</div>${marker}`);
  writeFileSync(file, html);
}

console.log(`Enriched ${Object.keys(routes).length} acquisition SEO routes`);
