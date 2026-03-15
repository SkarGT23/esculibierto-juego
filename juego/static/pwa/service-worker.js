// Nombre de la cache
const CACHE_NAME = 'esculibierto-cache-v1';

// Archivos que siempre cacheamos al instalar
const urlsToCache = [
  '/',
  '/static/pwa/manifest.json',
  '/static/pwa/snake_9339345.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activación: borrar caches antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
});

// Fetch: primero cache, luego red y actualizar cache automáticamente
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).then(networkResponse => {
        // Guardamos el nuevo recurso en cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Aquí puedes devolver un fallback, por ejemplo una página offline
      });
    })
  );
});