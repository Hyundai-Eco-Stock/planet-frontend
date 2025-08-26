importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Firebase 구성
firebase.initializeApp({
    apiKey: "AIzaSyDtSf2TcLa8wba4nWUu9Z71HVN0F6Lso6c",
    authDomain: "planet-4023d.firebaseapp.com",
    projectId: "planet-4023d",
    storageBucket: "planet-4023d.firebasestorage.app",
    messagingSenderId: "1034734598735",
    appId: "1:1034734598735:web:ab7b799fa19f360c7f483a",
    measurementId: "G-3NF9RCVRC7"
});

const messaging = firebase.messaging();

// 백그라운드 푸시 수신
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

    const notificationTitle = payload.notification?.title || '알림';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/planet-logo-512.png',
        data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});