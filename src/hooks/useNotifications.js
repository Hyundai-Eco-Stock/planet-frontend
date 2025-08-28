import { useEffect } from "react";
import { requestForToken, onMessageListener } from "@/firebase-init";
import { getMessaging, deleteToken } from "firebase/messaging";
import useNotificationStore from "@/store/notificationStore";

export const useNotifications = () => {
	const messaging = getMessaging();

	const { setNotification, pushEnabled, setPushEnabled } = useNotificationStore();

	useEffect(() => {
		// 포그라운드 메시지 리스너
		const unsubscribePromise = onMessageListener().then((payload) => {
			console.log("포그라운드 메시지 수신:", payload);
			setNotification({
				title: payload.notification.title,
				body: payload.notification.body,
			});

			// 브라우저 알림도 띄움
			new Notification(payload.notification.title, {
				body: payload.notification.body,
				icon: "/planet-logo-512.png",
			});
		});

		return () => {
			unsubscribePromise.then((unsubscribe) => unsubscribe && unsubscribe());
		};
	}, [setNotification]);

	// 권한 요청
	const requestPermission = () => {
		if (
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			(window.location.protocol === "https:" || window.location.hostname === "localhost")
		) {
			// 바로 처리되어보이도록 바로 처리
			requestForToken().catch(() => { setPushEnabled(true); });
			setPushEnabled(true);
		} else {
			alert("HTTPS 환경이 아니거나 Push API를 지원하지 않아 알림을 요청할 수 없습니다.");
		}
	};

	// 토큰 삭제
	const revokePushToken = async () => {
		try {
			// 바로 처리되어보이도록 바로 처리
			deleteToken(messaging).catch(() => { setPushEnabled(true); });
			setPushEnabled(false);
			console.log("푸시 알림 토큰 삭제 성공");
		} catch (err) {
			console.error("푸시 알림 토큰 삭제 실패:", err);
		}
	};

	return { pushEnabled, requestPermission, revokePushToken };
};