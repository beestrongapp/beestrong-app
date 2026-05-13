const CACHE = 'beestrong-v79';
const ASSETS = ['./', './index.html', './manifest.json', './styles.css', './i18n.js', './storage.js', './workouts.js', './supabase.js', './push.js', './coach.js', './friends.js', './admin.js', './app.js', './whats-new.json', './logo.jpg', './light_logo.png', './icons/icon-192.png', './icons/icon-512.png', './icons/light-icon-192.png', './icons/light-icon-512.png', 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET')return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  if(sameOrigin){
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});

self.addEventListener('push', e => {
  let data={};
  try{data=e.data?e.data.json():{};}catch(err){data={body:e.data?.text?.()||''};}
  const title=data.title||'BeeStrong';
  const options={
    body:data.body||'New notification',
    icon:'./icons/icon-192.png',
    badge:'./icons/icon-192.png',
    tag:data.tag||data.type||'beestrong',
    data:{url:data.url||'./?screen=notifications',...data},
  };
  e.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url=new URL(e.notification.data?.url||'./?screen=notifications', self.location.origin).href;
  e.waitUntil((async()=>{
    const allClients=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of allClients){
      if('focus' in client){
        client.focus();
        client.navigate(url);
        return;
      }
    }
    await clients.openWindow(url);
  })());
});
