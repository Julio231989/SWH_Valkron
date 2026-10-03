const CACHE_NAME = 'valkron-shell-v8';
const SHELL_FILES = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Cachea cada archivo por separado: si uno falla (ej. 404 puntual), los demás
      // igual quedan guardados. cache.addAll() es todo-o-nada y eso era el bug real:
      // un solo archivo fallando en la instalación dejaba la app SIN caché alguna,
      // por eso no abría sin internet.
      Promise.allSettled(SHELL_FILES.map((f) => cache.add(f)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Cualquier navegación (abrir la app, entrar a la carpeta raíz, recargar):
  // red primero; si no hay internet, sirve el index.html cacheado sin importar
  // la URL exacta que se pidió. Esto es lo que realmente garantiza que la app
  // abra offline, en vez de depender de que la ruta coincida letra por letra.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  const url = new URL(req.url);
  const isShellFile = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace('./', '')));
  if (!isShellFile) return; // deja pasar todo lo demás (incluye fetch al Apps Script) sin interceptar

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
