// Convention typographique française : un espace insécable avant !, ?, :
// et ; empêche que ce signe se retrouve seul en début de ligne suivante (ex.
// un titre "Akwaba Gaspard NZ !" coupé juste avant le "!"). Ne remplace que
// les espaces déjà présentes — n'ajoute jamais d'espace là où il n'y en a
// pas, pour ne pas modifier un contenu qui n'en avait pas.
const NBSP = " ";

export const withFrenchSpacing = (text) =>
  typeof text === "string" ? text.replace(/ ([!?;:])/g, `${NBSP}$1`) : text;
