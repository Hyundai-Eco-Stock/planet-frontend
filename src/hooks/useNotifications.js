import { useState, useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/firebase-init';

/**
 * PWA/FCM 관련 알림 로직을 처리하는 커스텀 훅
 * @returns {{notification: {title: string, body: string}, requestPermission: function}}
 */
export const useNotifications = () => {
	const [notification, setNotification] = useState({ title: '', body: '' });

	useEffect(() => {
		// 페이지 로드 시 자동으로 토큰 요청
		// if (
		// 	'serviceWorker' in navigator &&
		// 	'PushManager' in window &&
		// 	(window.location.protocol === 'https:' || window.location.hostname === 'localhost')
		// ) {
		// 	requestForToken();
		// } else {
		// 	console.log('HTTPS 환경이 아니거나 Push API를 지원하지 않아 FCM을 초기화할 수 없습니다.');
		// }

		// 포그라운드 메시지 리스너 설정
		const unsubscribePromise = onMessageListener().then((payload) => {
			console.log('포그라운드 메시지 수신:', payload);
			setNotification({
				title: payload.notification.title,
				body: payload.notification.body,
			});
			// 앱이 포그라운드에 있을 때도 브라우저 기본 알림을 띄웁니다.
			new Notification(payload.notification.title, {
				body: payload.notification.body,
				icon: '/planet-logo-512.png',
			});
		});

		// 3. 컴포넌트 언마운트 시 리스너 해제 (기존 코드의 버그 수정 포함)
		return () => {
			unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
		};
	}, []);

	// UI에서 수동으로 권한을 요청하는 함수
	const requestPermission = () => {
		if (
			'serviceWorker' in navigator &&
			'PushManager' in window &&
			(window.location.protocol === 'https:' || window.location.hostname === 'localhost')
		) {
			requestForToken();
		} else {
			alert('HTTPS 환경이 아니거나 Push API를 지원하지 않아 알림을 요청할 수 없습니다.');
		}
	}

	return { notification, requestPermission };
};