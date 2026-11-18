// Les liens publiés par l'administration doivent être de vrais liens HTTPS,
// jamais des schémas exécutables ni des adresses locales.
export function safeNotificationUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || !hostname ||
        hostname === "localhost" || hostname.endsWith(".localhost") ||
        hostname.endsWith(".local") || hostname === "0.0.0.0" ||
        /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(hostname) ||
        hostname === "[::1]") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function isGaspardNewsUrl(value) {
  const safe = safeNotificationUrl(value);
  if (!safe) return false;
  const target = new URL(safe);
  return (target.hostname === "gaspardnz.style" || target.hostname.endsWith(".gaspardnz.style")) &&
    /^\/actualites\/?$/.test(target.pathname);
}
