// src/firebase-init.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
    apiKey: "AIzaSyDtSf2TcLa8wba4nWUu9Z71HVN0F6Lso6c",
    authDomain: "planet-4023d.firebaseapp.com",
    projectId: "planet-4023d",
    storageBucket: "planet-4023d.firebasestorage.app",
    messagingSenderId: "1034734598735",
    appId: "1:1034734598735:web:ab7b799fa19f360c7f483a",
    measurementId: "G-3NF9RCVRC7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 웹 푸시 인증을 위한 VAPID 키 (Firebase 콘솔에서 생성)
const VAPID_KEY = 'BOsr26EM7TknHD9EI7P8eJKhQopJEoi6RyJqy7od9G0-tgWhfd6ys_Sb3AUkH2mAVregCevONFN_uVDDqHQyMbg';

// 알림 권한 요청 및 토큰 가져오기
export const requestForToken = async () => {
    console.log('FCM 토큰 요청 중...');
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // navigator.serviceWorker.ready를 사용하여 서비스 워커가 활성화될 때까지 기다립니다.
            // 이 Promise는 서비스 워커가 성공적으로 등록되고 활성화되면 해당 등록 객체(registration)로 resolve됩니다.
            const registration = await navigator.serviceWorker.ready;

            // registration은 이제 null이 아닐 확률이 매우 높습니다.
            // 만약 어떤 이유로든 ready가 resolve되었는데도 registration이 null이라면 FCM이 작동하지 않을 것입니다.
            if (registration) {
                // Firebase Messaging에 이미 등록된 서비스 워커를 사용하도록 명시적으로 전달합니다.
                const currentToken = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration // 여기에 registration 객체를 전달!
                });

                if (currentToken) {
                    console.log('현재 FCM 토큰:', currentToken);
                    // TODO: 이 토큰을 여러분의 백엔드 서버로 보내어 특정 사용자에게 알림을 보낼 때 사용하도록 저장합니다.
                } else {
                    console.log('FCM 토큰을 사용할 수 없습니다. 권한이 없거나 차단되었습니다.');
                }
            } else {
                console.error('Service Worker ready promise resolved but registration was null. FCM may not function correctly.');
            }
        } else {
            console.log('알림 권한이 거부되었습니다.');
        }
    } catch (err) {
        console.error('FCM 토큰을 가져오는 중 오류 발생:', err);
    }
};

// 포그라운드 메시지 리스너 (앱이 활성화되어 있을 때 알림 수신)
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('포그라운드 메시지 수신:', payload);
            resolve(payload);
        });
    });

export default app;
