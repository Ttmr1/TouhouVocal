const CACHE_NAME = 'touhou-vocal-v21';

const APP_SHELL = [
  './index.html',
  './styles.css',
  './data.js',
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

// ==========================================
// 全ファイル共通：まずネットワークから最新版を取得し、
// 取得できた場合はキャッシュを更新しておく。
// オフライン等でネットワークが使えない時だけ、キャッシュにあれば
// そちらを返す（＝オフラインでもアプリ自体は開ける）。
// この方式にすることで、CACHE_NAME を手動で書き換え忘れても、
// オンラインであれば常に最新版のファイルが表示されるようになる。
// ==========================================
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  event.respondWith(

    fetch(event.request, { cache: 'reload' })
      .then((response) => {

        const responseClone = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          })
          .catch(() => {});

        return response;

      })
      .catch(() => {

        // オフラインの場合だけキャッシュを使用
        return caches.match(event.request);

      })

  );

});
