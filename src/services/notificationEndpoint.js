// Keeps the existing admin UI unchanged while allowing the notification API
// to run on a separate HTTPS origin (Cloudflare Worker). Without this setting,
// requests continue to use the site's existing /api routes.
export function notificationEndpoint(path) {
  if (typeof path !== "string" || !/^\/api\/(?:notifications\/[a-z-]+|admin-notifications)$/.test(path)) {
    throw new Error("Route de notification non autorisée");
  }
  const origin = String(import.meta.env?.VITE_GNZ_NOTIFICATION_API_ORIGIN || "").replace(/\/$/, "");
  if (!origin) return path;
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("Serveur de notifications non configuré");
  }
  return `${parsed.origin}${path}`;
}
