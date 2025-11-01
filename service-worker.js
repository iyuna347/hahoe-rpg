
self.addEventListener('install',e=>{
  e.waitUntil(caches.open('hahoe-v2').then(c=>c.addAll([
    './','./index.html','./styles.css','./app.js','./manifest.json',
    './assets/characters/yangban.png','./assets/characters/yeon.png',
    './assets/characters/ttogi.png','./assets/characters/eojin.png'
  ])));
});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
