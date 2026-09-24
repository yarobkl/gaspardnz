// Libellés lisibles pour les types de demande enregistrés par le site.
export const REQUEST_TYPE_LABELS = {
  partner_application: "Candidature partenaire",
  partner_contact: "Demande via partenaire",
  booking_intent: "Demande de rendez-vous",
};

export const requestTypeLabel = (type) => REQUEST_TYPE_LABELS[type] || type || "Demande";
