// Finora is fully online (no offline-first data queue). This service worker
// exists so the app passes PWA installability checks on Android/iOS; it does
// not cache API responses or app data, only provides a minimal offline
// fallback for navigation requests so a lost connection doesn't show the
// browser's default error page.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          "<!doctype html><title>Finora</title><body style='font-family:sans-serif;padding:2rem'><h1>You're offline</h1><p>Finora needs an internet connection. Please reconnect and try again.</p></body>",
          { headers: { "Content-Type": "text/html" } }
        )
    )
  );
});
