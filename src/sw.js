// Workbox 런타임 API 사용 (주입은 빌드 단계에서)
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Firebase Cloud Messaging
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Firebase 구성 객체
const firebaseConfig = {
    apiKey: "AIzaSyDtSf2TcLa8wba4nWUu9Z71HVN0F6Lso6c",
    authDomain: "planet-4023d.firebaseapp.com",
    projectId: "planet-4023d",
    storageBucket: "planet-4023d.firebasestorage.app",
    messagingSenderId: "1034734598735",
    appId: "1:1034734598735:web:ab7b799fa19f360c7f483a",
    measurementId: "G-3NF9RCVRC7"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 백그라운드 메시지 수신 처리
onBackgroundMessage(messaging, (payload) => {
    console.log('[src/sw.js] 백그라운드 메시지 수신:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/planet-logo-512.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
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
    const targetPath = event.notification.data?.targetUrl || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // 이미 열려 있는 탭이 있으면 포커스
            for (const client of windowClients) {
                if (client.url.includes(targetPath)) {
                    return client.focus();
                }
            }
            // 없으면 새 탭으로 열기, 도메인 기반 URL 생성
            const origin = self.location.origin;
            return clients.openWindow(origin + targetPath);
        })
    );
});