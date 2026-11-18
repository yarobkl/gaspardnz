// L'API de notifications peut quitter Vercel sans déplacer le site ni créer
// une seconde page Actualités. Sans variable de déploiement, les routes
// historiques restent inchangées, y compris pour les builds iOS existants.
const rootRoutes = new Set([
  "/api/admin-notifications",
  "/api/admin-push-pair",
  "/api/admin-notification-test",
]);
const notificationRoutes = new Set([
  "send-campaign", "push-subscription", "push-test-device",
  "admin-notifications", "admin-push-pair", "admin-notification-test",
]);

export function notificationEndpoint(path, { native = false } = {}) {
  const action = typeof path === "string" && path.startsWith("/api/notifications/")
    ? path.slice("/api/notifications/".length) : null;
  if (!rootRoutes.has(path) && !notificationRoutes.has(action)) {
    throw new Error("Route de notification non autorisée");
  }

  const rawOrigin = String(import.meta.env?.VITE_GNZ_NOTIFICATION_API_ORIGIN || "").trim();
  if (!rawOrigin) return native ? `https://gaspardnz.style${path}` : path;

  const url = new URL(rawOrigin);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Serveur de notifications non configuré");
  }
  const workerPath = rootRoutes.has(path)
    ? `/api/notifications/${path.slice("/api/".length)}` : path;
  return `${url.origin}${workerPath}`;
}
