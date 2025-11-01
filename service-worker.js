// 최신 버전 강제 로드용 (개발 단계 캐시 비활성화)
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// 모든 요청을 네트워크에서 새로 받아오도록 설정
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
