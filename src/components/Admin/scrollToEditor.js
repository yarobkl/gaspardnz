// Sur mobile, le formulaire d'édition s'affiche en dessous du tableau (une
// seule colonne, cf. admin-v2.css @media max-width:1180px). Sans ce
// défilement, cliquer sur « Modifier » ou « Ajouter » ne change rien à
// l'écran visible : on dirait que le bouton ne fait rien.
export function scrollToAdminEditor() {
  requestAnimationFrame(() => {
    document.getElementById("gnz-admin-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
