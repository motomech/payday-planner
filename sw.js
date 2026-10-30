const CACHE="payday-v10";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Always ask the network first, skipping the browser's HTTP cache, so a new version shows on the next open. Offline falls back to the saved copy.
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const same=new URL(e.request.url).origin===location.origin;
  const saved=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("./index.html"));
  e.respondWith(fetch(e.request,same?{cache:"no-cache"}:undefined).then(r=>{
    if(r.ok&&same){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}
    // If the site is down or returns an error page, keep showing the saved app instead.
    if(!r.ok&&same)return saved().then(s=>s||r);
    return r;
  }).catch(saved));
});
