// Un <input type="datetime-local"> lit et écrit l'heure LOCALE du navigateur
// ("2026-10-15T14:30", sans fuseau). L'ancien code le remplissait avec
// toISOString().slice(0,16), c'est-à-dire l'heure UTC : à Paris, un
// rendez-vous de 20:45 s'affichait 18:45 dans la fiche, et chaque
// « Enregistrer » d'une promotion reculait ses dates de 1 à 2 heures
// (valeur UTC relue comme une heure locale, puis reconvertie en UTC).
export function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

// Inverse : la chaîne saisie (heure locale) vers un instant ISO UTC.
export function fromDateTimeLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
