// Workbox 런타임 API 사용 (주입은 빌드 단계에서)
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// 빌드 시 vite-plugin-pwa가 __WB_MANIFEST 를 주입
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// SPA 라우팅(정적 파일 404일 때 index.html로)
import { createHandlerBoundToURL } from 'workbox-precaching';
registerRoute(
    ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/api'),
    createHandlerBoundToURL('/index.html')
);

// API: 오프라인 내구성보다 신선도 우선일 때
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api',
        networkTimeoutSeconds: 5,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 10 }), // 10분
        ],
    })
);

// 이미지: 캐시 히트율이 중요한 리소스
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }), // 7일
        ],
    })
);

// 업데이트 플로우: 대기 중인 새 SW 바로 활성화
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});