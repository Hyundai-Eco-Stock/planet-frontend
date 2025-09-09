import Swal from "sweetalert2";

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

import { registerFcmToken } from "@/api/fcm_token/fcmToken.api";

import useAuthStore from '@/store/authStore';
import useNotificationStore from '@/store/notificationStore';


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
export const VAPID_KEY = 'BOsr26EM7TknHD9EI7P8eJKhQopJEoi6RyJqy7od9G0-tgWhfd6ys_Sb3AUkH2mAVregCevONFN_uVDDqHQyMbg';

// 알림 권한 요청 및 토큰 가져오기
export const requestForToken = async () => {
    // console.log('FCM 토큰 요청 중...');
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
                const currentToken = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (currentToken) {
                    console.log('현재 FCM 토큰:', currentToken);
                    // 백엔드에 등록 요청
                    if (useAuthStore.getState().accessToken != null) {
                        registerFcmToken(currentToken);
                    }
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

// 포그라운드 메시지 리스너 초기화 함수
export const initializeForegroundMessaging = () => {
    onMessage(messaging, (payload) => {
        console.log('포그라운드 메시지 수신 (중앙 리스너):', payload);

        // 스토어 상태 업데이트 (인앱 UI용)
        // useNotificationStore.getState().setNotification({
        //     title: payload.notification.title,
        //     body: payload.notification.body,
        // });
        const { title, body } = payload.notification || {};
        const path = payload.data?.path || "/";

         // 개발 환경: 강제 모바일 테스트
        // const forceMobile = import.meta.env.DEV && true
        // const isMobile = forceMobile || /Mobi|Android/i.test(navigator.userAgent);
        // 운영 환경: 모바일, 브라우저 환경 구분
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);

        // 브라우저 알림은 페이지가 활성화 상태일 때만 표시
        if (document.visibilityState === 'visible') {
            if (isMobile) {
                Swal.fire({
                    toast: true,
                    position: "top",
                    html: `
                        <div style="width:100%; display:flex; align-items:center; gap:12px;">
                            <img src="/planet-logo-512.png" alt="logo" style="width:32px; height:32px; border-radius:8px;" />
                            <div style="text-align:left;">
                            <div style="font-weight:600; font-size:14px; color:#111;">${title}</div>
                            <div style="font-size:12px; color:#555;">${body}</div>
                            </div>
                        </div>
                    `,
                    showConfirmButton: false,
                    background: "#fff",
                    customClass: {
                        popup: "shadow-lg rounded-xl",
                    },
                    timer: 5000,
                    timerProgressBar: true,
                    didOpen: (popup) => {
                        popup.addEventListener("click", () => {
                          window.location.href = path; // 클릭 시 페이지 이동
                        });
                    },
                });
            } else {
                // new Notification(payload.notification.title, {
                //     body: payload.notification.body,
                //     icon: "/planet-logo-512.png",
                // });
            }
        }
    });
};


export default app;