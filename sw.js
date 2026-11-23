var C="krupy-v11",A=["./","index.html","krupy.json","manifest.webmanifest","icon-192.png","icon-512.png"],F=["fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(A)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}))}))});
self.addEventListener("fetch",function(e){
 if(e.request.method!=="GET")return;
 var u=new URL(e.request.url);
 if(F.indexOf(u.hostname)>-1){e.respondWith(caches.match(e.request).then(function(m){return m||fetch(e.request).then(function(r){var c=r.clone();caches.open(C).then(function(x){x.put(e.request,c)});return r})}));return}
 if(u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(C).then(function(x){x.put(e.request,c)});return r}).catch(function(){return caches.match(e.request)}));
});
