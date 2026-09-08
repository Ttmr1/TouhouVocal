const CACHE_NAME = 'touhou-vocal-v20';

const APP_SHELL = [
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});


self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);


  // ==========================================
  // data.js は常に最新版をネットワークから取得
  // ==========================================
  if (url.pathname.endsWith('/data.js')) {

    event.respondWith(

      fetch(event.request, {
        cache: 'reload'
      })
      .catch(() => {

        // オフラインの場合だけキャッシュを使用
        return caches.match(event.request);

      })

    );

    return;

  }


  // ==========================================
  // その他はキャッシュ優先
  // ==========================================
  event.respondWith(

    caches.match(event.request)
      .then((cached) => {

        if (cached) {
          return cached;
        }

        return fetch(event.request)
          .then((response) => {

            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              })
              .catch(() => {});

            return response;

          });

      })

  );

});