// Un <a download> ne force le téléchargement que sur un fichier de même
// origine : sur l'URL Supabase Storage (autre domaine), le navigateur
// l'ignore et navigue vers le PDF à la place. Une version précédente
// contournait ça en récupérant le fichier en mémoire (fetch + blob) avant de
// le proposer via une URL locale — mais sur Safari iOS, le clic déclenché
// après un await n'est plus reconnu comme un geste utilisateur : le
// téléchargement était silencieusement ignoré, sans erreur (signalé par un
// utilisateur réel). Le paramètre "download" de Supabase Storage renvoie un
// Content-Disposition: attachment portant le nom demandé directement depuis
// le serveur — un téléchargement natif, déclenché de façon synchrone par le
// clic, qui fonctionne sur tous les navigateurs y compris Safari iOS.
export async function downloadFile(url, filename) {
  if (!url) throw new Error("URL de téléchargement manquante");
  const separator = url.includes("?") ? "&" : "?";
  const downloadUrl = `${url}${separator}download=${encodeURIComponent(filename || "fichier")}`;
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
