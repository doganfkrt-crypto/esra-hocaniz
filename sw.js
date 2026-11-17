// İnternet olmadan açılabilmesi için program dosyalarını iPad'de saklar.
// Program güncellendiğinde SURUM değerini artırın (index.html'deki APPVER ile aynı olsun).
const SURUM = 'esra-hocaniz-v9';
const DOSYALAR = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // cache:'reload' → sunucunun 10 dakikalık önbelleğini atlayıp her zaman en yeni dosyayı al
  e.waitUntil(caches.open(SURUM)
    .then(c => Promise.all(DOSYALAR.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => { if (r.ok) return c.put(u, r); }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce internetten en günceli (önbelleği atlayarak) dene, internet yoksa iPad'deki kopyayı kullan.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const ayniSite = new URL(req.url).origin === location.origin;
  e.respondWith(
    fetch(ayniSite ? new Request(req, { cache: 'no-cache' }) : req).then(res => {
      if (res && res.ok && (ayniSite || req.url.includes('fonts.g'))) {
        const kopya = res.clone();
        caches.open(SURUM).then(c => c.put(req, kopya));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
