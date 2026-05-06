const VERSION = "gnz-v20260506-02fe76a";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
  ).then(() => self.clients.claim())
));

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // HTML → toujours réseau en priorité
  if (e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Autres assets → réseau d'abord, cache si offline
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then(r => {
        const clone = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
