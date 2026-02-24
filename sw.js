const CACHE = 'chipgames-list-v1';

self.addEventListener('install', function(e) {
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e) {
    var url = new URL(e.request.url);
    var isNav = e.request.mode === 'navigate' || e.request.destination === 'document';
    var isHtml = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/');

    if (isNav || isHtml) {
        e.respondWith(
            fetch(e.request).then(function(res) {
                return res;
            }).catch(function() {
                return caches.match(e.request);
            })
        );
        return;
    }
    e.respondWith(
        fetch(e.request).then(function(res) {
            var clone = res.clone();
            caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
            return res;
        }).catch(function() {
            return caches.match(e.request);
        })
    );
});
