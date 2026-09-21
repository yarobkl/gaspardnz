// Un <a download> ne force le téléchargement que sur un fichier de même
// origine : sur l'URL Supabase Storage (autre domaine), le navigateur
// l'ignore et navigue vers le PDF à la place — exactement le comportement
// que ceci évite en récupérant le fichier en mémoire (blob) puis en le
// proposant via une URL locale, sans jamais quitter la page.
export async function downloadFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Téléchargement impossible (${response.status})`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || "fichier";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
