const CACHE_NAME = "fitlog-cache-v3";

const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./chart.umd.min.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Network-first for page navigations (HTML), so updates show immediately.
// Cache-first for static assets (JS/CSS/images), for offline speed.
self.addEventListener("fetch", (event) => {

    const isNavigation =
        event.request.mode === "navigate" ||
        (event.request.method === "GET" &&
         event.request.headers.get("accept") &&
         event.request.headers.get("accept").includes("text/html"));

    if(isNavigation){

        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                return cached;
            }
            return fetch(event.request).catch(() => cached);
        })
    );
});
