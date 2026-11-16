// İnternet olmadan açılabilmesi için program dosyalarını iPad'de saklar.
// Program güncellendiğinde SURUM değerini artırın.
const SURUM = 'esra-hocaniz-v2';
const DOSYALAR = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce internetten güncelini dene, yoksa iPad'deki kopyayı kullan.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && (new URL(req.url).origin === location.origin || req.url.includes('fonts.g'))) {
        const kopya = res.clone();
        caches.open(SURUM).then(c => c.put(req, kopya));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
