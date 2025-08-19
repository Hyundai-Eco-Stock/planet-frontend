import { useNotifications } from '@/hooks/useNotifications';

/**
 * FCM 알림 관련 UI를 담당하는 컴포넌트
 * - 알림 권한 요청 버튼
 * - 포그라운드 수신 알림 표시
 */
export function NotificationController() {
	const { notification, requestPermission } = useNotifications();

	return (
		<div>
			<button onClick={requestPermission}>
				알림 권한 요청
			</button>

			{notification.title && (
				<div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
					<h2>새로운 알림이 도착했어요!</h2>
					<h3>{notification.title}</h3>
					<p>{notification.body}</p>
				</div>
			)}
		</div>
	);
}
