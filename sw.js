// Service worker de RBL 27: deja el juego guardado en el celular.
// 20261114200029 y ["./", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "index.html", "manifest.webmanifest"] los completa build.py en cada build (así las actualizaciones llegan solas).
const VERSION = '20261114200029';
const CACHE = 'rbl27-' + VERSION;
const FILES = ["./", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "index.html", "manifest.webmanifest"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('rbl27-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  if (same) {
    // Archivos propios: primero la copia guardada (rápido y sin Internet)
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit =>
        hit || fetch(req).then(res => {
          if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
          return res;
        })
      )
    );
  } else if (/three/.test(url.href)) {
    // Motor 3D de los CDN: se guarda la primera vez que baja y después anda sin Internet
    e.respondWith(
      caches.match(req).then(hit =>
        hit || fetch(req).then(res => {
          if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
          return res;
        })
      )
    );
  }
});
