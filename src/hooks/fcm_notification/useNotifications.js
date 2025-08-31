import { useEffect, useCallback } from "react";
import { requestForToken, onMessageListener, VAPID_KEY } from "@/firebase-init";
import { getMessaging, deleteToken, getToken } from "firebase/messaging";
import useNotificationStore from "@/store/notificationStore";

export const useNotifications = () => {
	const messaging = getMessaging();

	const { setNotification, pushEnabled, setPushEnabled } = useNotificationStore();

	// 앱 로드 시 실제 권한 및 토큰 존재 여부를 확인하여 상태 동기화
	const syncPushEnabledState = useCallback(async () => {
		if ("Notification" in window && "serviceWorker" in navigator) {
			if (Notification.permission === "granted") {
				try {
					const registration = await navigator.serviceWorker.ready;
					const token = await getToken(messaging, { serviceWorkerRegistration: registration, vapidKey: VAPID_KEY });
					setPushEnabled(!!token);
				} catch (error) {
					console.error("Error getting FCM token during initial sync:", error);
					setPushEnabled(false);
				}
			} else {
				setPushEnabled(false);
			}
		} else {
			setPushEnabled(false);
		}
	}, [messaging, setPushEnabled]);

	

	// 권한 요청 및 토큰 발급
	const requestPermission = async () => {
		if (
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			(window.location.protocol === "https:" || window.location.hostname === "localhost")
		) {
			await requestForToken(); // 내부적으로 토큰 발급 및 서버 전송
			await syncPushEnabledState(); // 토큰 발급 후 상태 재동기화
		} else {
			alert("HTTPS 환경이 아니거나 Push API를 지원하지 않아 알림을 요청할 수 없습니다.");
		}
	};

	// 토큰 삭제
	const revokePushToken = async () => {
		try {
			await deleteToken(messaging);
			setPushEnabled(false);
			console.log("푸시 알림 토큰 삭제 성공");
		} catch (err) {
			console.error("푸시 알림 토큰 삭제 실패:", err);
			// 실패 시에도 UI는 비활성화된 것처럼 보이게 할 수 있으나,
			// 실제로는 토큰이 남아있을 수 있으므로 재동기화로 정확한 상태 반영
			await syncPushEnabledState();
		}
	};

	return { pushEnabled, requestPermission, revokePushToken, syncPushEnabledState };
};