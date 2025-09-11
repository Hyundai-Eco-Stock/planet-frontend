// Workbox 런타임 API 사용 (주입은 빌드 단계에서)
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// 서비스 워커의 표준 'push' 이벤트를 수신하여 모든 푸시 알림을 처리합니다.
// 이를 통해 vite-plugin-pwa에 의해 주입된 로직이나 다른 핸들러와의 충돌을 방지하고
// 알림 표시 로직을 일원화합니다.
self.addEventListener('push', (event) => {
    const payload = event.data.json();
    console.log('[Push 이벤트 수신] ', payload);

    const notificationTitle = payload.notification?.title || '새로운 알림';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/planet-logo-512.png',
        data: payload.data
    };

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(windowClients => {
        let clientIsVisible = false;
        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.visibilityState === "visible") {
                clientIsVisible = true;
                // 메시지를 클라이언트로 전송
                windowClient.postMessage({
                    message: 'Received a push message.',
                    payload: payload
                });
                break;
            }
        }

        if (!clientIsVisible) {
            // 클라이언트가 보이지 않으면 시스템 알림 표시
            return self.registration.showNotification(notificationTitle, notificationOptions);
        }
    });

    event.waitUntil(promiseChain);
});


// __WB_MANIFEST는 빌드 과정에서 주입됩니다.
// 개발 모드에서는 비어 있을 수 있으므로, index.html에 대한 항목을 수동으로 추가합니다.

// 1. dev에선 프리캐시 켜기
// const manifest = self.__WB_MANIFEST || [];
// if (import.meta.env.DEV) {
//     manifest.push({ url: '/index.html', revision: null });
// }

// 2. dev에선 프리캐시 끄기
let manifest = [];
if (!import.meta.env.DEV) {
    manifest = self.__WB_MANIFEST || [];
}
precacheAndRoute(manifest);
cleanupOutdatedCaches();

// SPA 라우팅(정적 파일 404일 때 index.html로)
if (!import.meta.env.DEV) {
    registerRoute(
        ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/api'),
        createHandlerBoundToURL('/index.html')
    );
}

// API 라우팅
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

// 이미지 라우팅
registerRoute(
    ({ request }) => request.destination === 'image',
    // new CacheFirst({
    //     cacheName: 'images',
    //     plugins: [
    //         new CacheableResponsePlugin({ statuses: [0, 200] }),
    //         new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }), // 7일
    //     ],
    // }),
    new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
        ],
    }),
);

// 서비스 워커 즉시 활성화
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const path = event.notification.data?.path || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // 이미 열려 있는 탭이 있으면 포커스
            for (const client of windowClients) {
                if (client.url.includes(path)) {
                    return client.focus();
                }
            }
            // 없으면 새 탭으로 열기, 도메인 기반 URL 생성
            const origin = self.location.origin;
            return clients.openWindow(origin + path);
        })
    );
});