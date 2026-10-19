// Catarsis · service worker
// - Páginas y archivos propios: primero internet (siempre la versión más nueva); sin conexión usa la copia guardada.
// - Firebase (versión fija 10.12.2): se guarda en el teléfono la primera vez y luego abre al instante.
// - Fotos e íconos: se muestran desde el teléfono y se actualizan por detrás.
const C='catarsis-v2';
const SDK='https://www.gstatic.com/firebasejs/10.12.2/';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.url.startsWith(SDK)){
    e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone()).catch(()=>{});return res}))));
    return;
  }
  if(u.origin!==location.origin)return;
  if(u.searchParams.has('nc'))return;   // pedido «sin copia» (ej. plantilla de la giftcard): directo a internet
  if(/\.(jpe?g|png|webp|gif|svg|ico)$/i.test(u.pathname)){
    e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>{
      const red=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone()).catch(()=>{});return res});
      if(m){red.catch(()=>{});return m}
      return red;
    })));
    return;
  }
  e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(r,c)).catch(()=>{})}return res}).catch(()=>caches.match(r)));
});
