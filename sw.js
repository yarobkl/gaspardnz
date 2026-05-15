const VERSION = "gnz-v20260515-965f205";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSION).then(cache => {
      const scope = self.registration.scope;
      return cache.addAll([scope + "hero.mp4"]).catch(() => {});
    })
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Vidéo : cache-first pour lecture hors-ligne (mode avion)
  if (url.pathname.endsWith(".mp4") || url.pathname.endsWith(".webm")) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(VERSION).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => cached || Response.error());
      })
    );
    return;
  }

  // Tout le reste : réseau d'abord, cache en fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          caches.open(VERSION).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
