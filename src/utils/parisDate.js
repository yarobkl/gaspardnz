// Le "Style du mois" doit changer selon l'heure de Paris (celle de Gaspard,
// qui publie), pas celle du navigateur du visiteur ni l'UTC. `new
// Date().toISOString().slice(0,10)` donnait la date UTC : entre minuit et 1h
// ou 2h du matin à Paris (selon l'heure d'été), c'était encore la veille, et
// un style programmé pour le 1er du mois n'apparaissait qu'après coup.
export function todayInParis() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}
