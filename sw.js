/* Thrust Royale service worker: makes the game load offline.
   Bump V whenever you ship a new version so players get fresh files. */
const V = 'zz-v56';
const SHELL = ['./', './Royale.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon.png', './fonts/chakra-petch-500.woff2', './fonts/chakra-petch-700.woff2'];

self.addEventListener('install', e => {
  // allSettled: a missing optional file (e.g. fonts not downloaded yet) must not break install
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // never touch Supabase / PeerJS / other hosts
  if (r.mode === 'navigate') {   // page: network first (fresh updates), cache when offline or slow
    e.respondWith(new Promise(res => {
      const t = setTimeout(() => caches.match('./Royale.html').then(m => m && res(m)), 3500);
      fetch(r).then(n => { clearTimeout(t); if (n.ok) { const c = n.clone(); caches.open(V).then(k => k.put('./Royale.html', c)); } res(n); })
        .catch(() => { clearTimeout(t); caches.match('./Royale.html').then(m => res(m || Response.error())); });
    }));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(n => {   // assets: cache first
    if (n.ok) { const c = n.clone(); caches.open(V).then(k => k.put(r, c)); } return n; })));
});
