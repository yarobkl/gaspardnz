// Navigateurs intégrés (TikTok, Instagram, Facebook, Snapchat, Line) connus
// pour mal calculer les unités de hauteur dynamique (dvh/svh) sur une section
// plein écran avec vidéo en boucle : signalé par un utilisateur réel — le
// lien ouvert depuis TikTok restait bloqué sur la vidéo d'accueil, impossible
// de faire défiler la page.
const IN_APP_BROWSER_PATTERN = /musical_ly|bytedance|tiktok|instagram|FBAN|FBAV|Snapchat|Line\//i;

export const isInAppBrowser = () => {
  if (typeof navigator === "undefined" || !navigator.userAgent) return false;
  return IN_APP_BROWSER_PATTERN.test(navigator.userAgent);
};
