// ═══════════════════════════════════════════════════
// BRIEFEED SERVICE WORKER
// Cache-first pour l'app shell, network pour les flux
// ═══════════════════════════════════════════════════

const CACHE_NAME = 'briefeed-v3';

// Ressources à mettre en cache au premier lancement
const SHELL_ASSETS = [
    './',
    './index.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;590;700;800&family=Geist:wght@400;500;600;700;800&display=swap',
];

// ── Installation : mise en cache du shell ─────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ── Activation : nettoyage des vieux caches ───────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch : stratégie intelligente ───────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Proxies RSS → toujours réseau, jamais de cache
    const networkOnly = [
        'allorigins.win',
        'corsproxy.io',
        'corsproxy.org',
        'api.codetabs.com',
        'thingproxy.freeboard.io',
        'rss2json.com',
        'rss-to-json-serverless-api.vercel.app',
        'api.cors.lol',
        'cors.deno.dev',
    ];
    if (networkOnly.some(d => url.hostname.includes(d))) {
        return; // Laisser passer sans interception
    }

    // Favicons (Google s2 + icon.horse) → cache 7 jours
    if (
        (url.hostname === 'www.google.com' && url.pathname.includes('s2/favicons')) ||
        url.hostname === 'icons.duckduckgo.com' ||
        url.hostname === 'icon.horse'
    ) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(cached => {
                    if (cached) return cached;
                    return fetch(event.request).then(response => {
                        if (response.ok) cache.put(event.request, response.clone());
                        return response;
                    }).catch(() => cached);
                })
            )
        );
        return;
    }

    // Polices Google Fonts → cache long terme
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(cached => cached || fetch(event.request).then(r => {
                    if (r.ok) cache.put(event.request, r.clone());
                    return r;
                }))
            )
        );
        return;
    }

    // App shell (index.html) → RÉSEAU d'abord (voir les MAJ aussitôt),
    // cache en secours uniquement hors-ligne
    if (url.origin === self.location.origin || event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => caches.open(CACHE_NAME).then(cache => cache.match(event.request)))
        );
        return;
    }
});

// ── Periodic Background Sync ──────────────────────
self.addEventListener('periodicsync', event => {
    if (event.tag === 'briefeed-refresh') {
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => client.postMessage({ type: 'BACKGROUND_REFRESH' }));
            })
        );
    }
});

// ── Background Sync fallback ──────────────────────
self.addEventListener('sync', event => {
    if (event.tag === 'briefeed-sync') {
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(c => c.postMessage({ type: 'BACKGROUND_REFRESH' }));
            })
        );
    }
});
