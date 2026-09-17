// Points de mesure standards pour un costume sur-mesure homme (veste +
// pantalon). Stockés comme un objet libre (measurements jsonb) plutôt que des
// colonnes figées : ajouter un point de mesure plus tard ne demandera aucune
// migration, seulement une ligne ici.
export const MEASUREMENT_FIELDS = [
  // Veste
  { key: "tour_poitrine", label: "Tour de poitrine", group: "Veste" },
  { key: "tour_taille_veste", label: "Tour de taille (veste)", group: "Veste" },
  { key: "tour_bassin", label: "Tour de bassin", group: "Veste" },
  { key: "tour_cou", label: "Tour de cou", group: "Veste" },
  { key: "largeur_epaules", label: "Largeur d'épaules", group: "Veste" },
  { key: "carrure_dos", label: "Carrure dos", group: "Veste" },
  { key: "longueur_manche", label: "Longueur de manche", group: "Veste" },
  { key: "tour_bras", label: "Tour de bras", group: "Veste" },
  { key: "tour_poignet", label: "Tour de poignet", group: "Veste" },
  { key: "longueur_veste", label: "Longueur de veste", group: "Veste" },
  // Pantalon
  { key: "tour_taille_pantalon", label: "Tour de taille (pantalon)", group: "Pantalon" },
  { key: "tour_bassin_pantalon", label: "Tour de bassin (pantalon)", group: "Pantalon" },
  { key: "tour_cuisse", label: "Tour de cuisse", group: "Pantalon" },
  { key: "tour_genou", label: "Tour de genou", group: "Pantalon" },
  { key: "tour_mollet", label: "Tour de mollet", group: "Pantalon" },
  { key: "longueur_entrejambe", label: "Longueur d'entrejambe", group: "Pantalon" },
  { key: "longueur_pantalon", label: "Longueur totale", group: "Pantalon" },
  // Général
  { key: "taille_client", label: "Taille (hauteur)", group: "Général" },
  { key: "poids_client", label: "Poids", group: "Général", unit: "kg" },
];

export const MEASUREMENT_GROUPS = ["Veste", "Pantalon", "Général"];

export const measurementUnit = (field) => field.unit || "cm";

export const ORDER_STATUS_LABELS = {
  nouvelle: "Nouvelle",
  en_cours: "En cours",
  terminee: "Terminée",
};

export const ORDER_STATUS_ORDER = ["nouvelle", "en_cours", "terminee"];
