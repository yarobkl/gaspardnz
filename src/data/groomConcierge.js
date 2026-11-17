// Offres communiquées par GaspardNZ (12 novembre 2026).
// Catalogue éditorial iOS uniquement : les prix sont indicatifs et les
// disponibilités, déplacements et conditions font l'objet d'une confirmation.
// Ne pas utiliser ces données comme grille de facturation ou réservation payante.
export const GROOM_CONCIERGE_PACKAGES = [
  {
    id: "essentielle",
    name: "Élégance Essentielle",
    price: 199,
    duration: "1 h 30",
    inclusions: ["Préparation de la tenue", "Mise en tenue du marié"],
  },
  {
    id: "signature",
    name: "Signature",
    price: 349,
    duration: "4 h",
    inclusions: ["Entretien préparatoire", "Conseil sur la tenue et les accessoires", "Habillage le jour J", "Présence pendant les préparatifs et photos", "Ajustements et contrôle final"],
  },
  {
    id: "prestige",
    name: "Prestige",
    price: 599,
    duration: "8 h",
    inclusions: ["Préparation et conseils de silhouette", "Habillage et accessoires", "Accompagnement pendant la cérémonie et les photos", "Changement de tenue éventuel", "Contrôle de l'allure pour la réception"],
  },
  {
    id: "excellence",
    name: "Excellence Privée",
    price: 990,
    duration: "12 h",
    inclusions: ["Consultation privée", "Préparation de plusieurs tenues", "Présence pendant les moments principaux", "Gestion des changements et accessoires", "Kit de dépannage vestimentaire", "Accompagnement prolongé"],
  },
  {
    id: "marie-signature",
    name: "Marié Signature — Tenue & Groom Concierge",
    price: 799,
    fromPrice: true,
    duration: "Jusqu'à 4 h",
    inclusions: ["Associée à l'achat d'un costume GaspardNZ", "Conseil style et morphologie", "Sélection et essayage", "Coordination de la chemise et des accessoires", "Habillage le jour J et derniers ajustements"],
    note: "Offre combinée distincte de Signature à 349 € ; composition et tarif final à confirmer.",
  },
];

export const GROOM_CONCIERGE_OPTIONS = [
  { name: "Conseil vestimentaire avant mariage", price: "79 €", duration: "1 h" },
  { name: "Changement de tenue supplémentaire", price: "49 €" },
  { name: "Heure supplémentaire", price: "70 €" },
  { name: "Préparation simple d'un témoin", price: "59 €" },
  { name: "Déplacement hors zone", price: "Sur devis" },
];
