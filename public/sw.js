// Ancien service worker (cache hors-ligne des .mp4), plus utilisé par le
// site. Il interceptait les vidéos, ce que Safari sur iPhone gère mal
// (vidéo refusée, écran noir). Cette version ne sert qu'à se retirer
// d'elle-même des téléphones où il était resté installé.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => client.navigate(client.url));
  })());
});
