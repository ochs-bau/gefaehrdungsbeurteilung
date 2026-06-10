const CACHE = "gefb-pwa-v1";
const ASSETS = ["./","./index.html","./fix.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // externe Links (Normen) normal aus dem Netz
  const isDoc = req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if (isDoc) {                                           // immer aktuelle Version, offline aus Cache
    e.respondWith(fetch(req).then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return resp; })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
  } else {                                               // Icons/Manifest: cache-first
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return resp; })));
  }
});
