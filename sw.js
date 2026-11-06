/* çevrimdışı destek: önce ağdan dene (güncel kalsın), olmazsa kayıtlı kopyayı göster */
const C='kahvehane-v15';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','durak/','satranc/','pisti/','okey101/','kahvehane/','king/','kizma/','tavla/','batak/','bin/','pisti4/','dama/','icon-192.png']).catch(()=>{})))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))))});
