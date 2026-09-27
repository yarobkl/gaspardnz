// Le navigateur intégré de TikTok, spécifiquement (pas Instagram/Facebook/
// autres, sur demande explicite de l'utilisateur) : signalé par capture
// d'écran, il happait la vidéo d'accueil dans son lecteur plein écran natif
// au lieu de la jouer en fond de page (playsinline non respecté).
const TIKTOK_IN_APP_BROWSER_PATTERN = /musical_ly|bytedance|tiktok/i;

export const isTikTokInAppBrowser = () => {
  if (typeof navigator === "undefined" || !navigator.userAgent) return false;
  return TIKTOK_IN_APP_BROWSER_PATTERN.test(navigator.userAgent);
};
