import './App.css'

import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useNotifications } from '@/hooks/fcm_notification/useNotifications'
import useAuthStore from './store/authStore'
import Swal from 'sweetalert2'

import useNotificationStore from './store/notificationStore';

// Layouts
import LayoutShopping from '@/components/_layout/LayoutShopping' // 헤더 + 푸터
import LayoutLogoAndFooter from '@/components/_layout/LayoutLogoAndFooter' // 헤더 + 푸터
import LayoutBack from '@/components/_layout/LayoutBack' // 헤더만
import LayoutLogoOnly from '@/components/_layout/LayoutLogoOnly' // 헤더만
import LayoutLogoAndClose from '@/components/_layout/LayoutLogoAndClose' // 헤더만
import LayoutFooterOnly from '@/components/_layout/LayoutFooterOnly' // 푸터만
import LayoutNone from '@/components/_layout/LayoutNone'  // 아무것도 없음
import LayoutCartOrder from '@/components/_layout/LayoutCartOrder'  // 장바구니·주문 전용 레이아웃
import LayoutShoppingWithBack from '@/components/_layout/LayoutShoppingWithBack'
import AdminLayout from '@/components/_layout/AdminLayout' // 관리자

// -------------------------- 라우팅 시작 --------------------------
// 홈
import HomeMain from '@/pages/home/Home'

// 인증/인가
import Login from '@/pages/auth/Login'
import LoginSuccess from '@/pages/auth/LoginSuccess'
import OAuthSignUp from '@/pages/auth/OAuthSignUp'
import LocalSignUp from '@/pages/auth/LocalSignUp'
import SendPasswordChangeMail from '@/pages/auth/SendPasswordChangeMail'
import ChangePassword from '@/pages/auth/ChangePassword'

// 쇼핑
import ShoppingMain from '@/pages/shopping/ShoppingMain'
import ShoppingDetail from '@/pages/shopping/ShoppingDetail'

// 에코 스톡
import EcoStockMain from '@/pages/eco_stock/EcoStockMain'

// 마이 페이지
import MyPageMain from '@/pages/mypage/MyPageMain'
import MyProfile from '@/pages/mypage/MyProfile'
import MyCarInfo from '@/pages/mypage/MyCarInfo'
import MyCardInfo from '@/pages/mypage/MyCardInfo'
import MyEcoStockInfo from '@/pages/mypage/MyEcoStockInfo'
import Settings from '@/pages/mypage/Settings'
import MyBuyHistory from '@/pages/mypage/MyBuyHistory'
import EcoDealReservation from '@/pages/mypage/EcoDealReservation'
import MyRaffleHistory from '@/pages/mypage/MyRaffleHistory'

// 에코스톡 인증
import EcoStockCertificate from '@/pages/eco_stock_certificate/EcoStockCertificate'
import TumblerCertificate from '@/pages/eco_stock_certificate/TumblerCertificate'
import PaperBagNoUseCertificate from '@/pages/eco_stock_certificate/PaperBagNoUseCertificate'

// 결제 정보 생성
import OfflinePayCreate from '@/pages/offline_pay/OfflinePayCreate'

// 차량 입출차 기록 생성
import CarAccessHistoryCreate from '@/pages/car_access/CarAccessHistoryCreate'

// 장바구니
import CartMain from '@/pages/cart/CartMain'

// 주문
import DeliveryOrderPage from '@/pages/order/DeliveryOrderPage'
import PickupOrderPage from '@/pages/order/PickupOrderPage'

// 결제
import PaymentSuccessPage from '@/pages/payment/PaymentSuccessPage'
import PaymentFailPage from '@/pages/payment/PaymentFailPage'

// QR
import QrResolvePage from '@/pages/pickup/QrResolvePage'

// 에코딜
import EcoDealMain from '@/pages/eco_deal/EcoDealMain';
import EcoDealDetail from '@/pages/eco_deal/EcoDealDetail';

//래플 
import RaffleDetailPage from './pages/raffle/RaffleDetailPage'
import RaffleListPage from './pages/raffle/RaffleListPage'

// PHTI
import PhtiSurvey from '@/pages/phti/PhtiSurvey'
import PhtiResult from "@/pages/phti/PhtiResult";

// 관리자
import Test from '@/pages/admin/Test'
import EcoStockDashboard from '@/pages/admin/EcoStockDashboard'
import OrderProductDashboard from '@/pages/admin/OrderProductDashboard'
import PhtiDashboard from '@/pages/admin/PhtiDashboard'
import DonationDashboard from '@/pages/admin/DonationDashboard'

// -------------------------- 라우팅 끝 --------------------------

const OrderRedirect = () => {
	const location = useLocation()
	const deliveryType = location.state?.deliveryType || 'DELIVERY'

	if (deliveryType === 'PICKUP') {
		return <Navigate to="/orders/pickup" state={location.state} replace />
	}
	return <Navigate to="/orders/delivery" state={location.state} replace />
}


function App() {

	const { loginStatus } = useAuthStore();
	const navigate = useNavigate();
	const { pushEnabled } = useNotificationStore();

	useEffect(() => {
		console.log("pushEnabled: ", pushEnabled);
		// 로그인 시 푸시 알림이 거부되어 있으면
		if (!loginStatus) return;

		if (!pushEnabled) {
			// 아직 브라우저 알림 권한 요청한 적 없을 때 허용 요청하기
			if (Notification.permission === 'default') {
				Notification.requestPermission()
					.then((permission) => {
						console.log(permission); // "granted" | "denied" | "default"
					});
			}

			// 브라우저 알림 권한이 허용일 때 푸시 알림 허용을 위해 앱 세팅 페이지로 보내는 것 추천
			if (Notification.permission === 'granted') {
				Swal.fire({
					title: '알림 설정',
					text: '플래닛의 소식을 받아보시겠어요? 알림을 설정하면 에코딜, 래플 등 다양한 정보를 빠르게 얻을 수 있어요.',
					icon: 'info',
					showCancelButton: true,
					confirmButtonText: '설정하기',
					cancelButtonText: '다음에 할게요',
				}).then((result) => {
					if (result.isConfirmed) {
						navigate('/my-page/settings');
					}
				});
			}
		}
	}, [loginStatus]);

	return (
		<Routes>
			{/* 리다이렉트 path */}
			<Route path="/home" element={<Navigate to="/home/main" />} />
			<Route path="/" element={<Navigate to="/home" />} />
			<Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard/main" />} />

			{/* 쇼핑 헤더와 푸터 있는 Layout (헤더 + 푸터) */}
			<Route element={<LayoutShopping />}>
				<Route path="/home/main" element={<HomeMain />} />
				<Route path="/shopping/main" element={<ShoppingMain />} />
				<Route path="/eco-stock/main" element={<EcoStockMain />} />
				<Route path='/eco-deal/main' element={<EcoDealMain />} />
			</Route>

			{/* 로고만 있는 헤더와 푸터 Layout (헤더 + 푸터) */}
			<Route element={<LayoutLogoAndFooter />}>
				<Route path="/my-page/main" element={<MyPageMain />} />
				<Route path="/raffle" element={<RaffleListPage />} />
			</Route>

			{/* 뒤로가기 Layout (헤더 + 푸터) */}
			<Route element={<LayoutBack />}>
				<Route path="/send/password-change-mail" element={<SendPasswordChangeMail />} />
				<Route path="/eco-stock/certificate" element={<EcoStockCertificate />} />
				<Route path="/eco-stock/certificate/tumbler" element={<TumblerCertificate />} />
				<Route path="/eco-stock/certificate/paper-bag-no-use" element={<PaperBagNoUseCertificate />} />
				<Route path="/offline-pay/create" element={<OfflinePayCreate />} />
				<Route path="/my-page/profile" element={<MyProfile />} />
				<Route path="/my-page/my-eco-stock" element={<MyEcoStockInfo />} />
				<Route path="/my-page/my-car" element={<MyCarInfo />} />
				<Route path="/my-page/my-card" element={<MyCardInfo />} />
				<Route path="/my-page/settings" element={<Settings />} />
				<Route path="/my-page/my-buy-history" element={<MyBuyHistory />} />
				<Route path="/my-page/eco-deal-reservation" element={<EcoDealReservation />} />
				<Route path="/my-page/raffle-history" element={<MyRaffleHistory />} />
			</Route>

			{/* 뒤로 가기 + 장바구니 레이아웃 */}
			<Route element={<LayoutShoppingWithBack />}>
				<Route path="/shopping/detail" element={<ShoppingDetail />} />
				<Route path='/eco-deal/detail' element={<EcoDealDetail />} />
			</Route>

			{/* 로고,닫기가 있는 헤더와 푸터 Layout (헤더 + 푸터) */}
			<Route element={<LayoutLogoAndClose title="" />}>
				<Route path="/signup/local" element={<LocalSignUp />} />
				<Route path="/raffle/detail/:raffleId" element={<RaffleDetailPage />} />
				<Route path="/phti/survey" element={<PhtiSurvey />} />
				<Route path="/phti/result" element={<PhtiResult />} />
			</Route>

			{/* 로고만 있는 Layout (헤더만) */}
			<Route element={<LayoutLogoOnly title="" />}>
				<Route path="/signup/oauth" element={<OAuthSignUp />} />
				<Route path="/car-access-history/create" element={<CarAccessHistoryCreate />} />
			</Route>

			{/* 푸터만 있는 Layout (푸터만) */}
			<Route element={<LayoutFooterOnly />}>
				<Route path="/login" element={<Login />} />
			</Route>

			{/* 아무것도 없는 Layout */}
			<Route element={<LayoutNone />}>
				<Route path="/payments/success" element={<PaymentSuccessPage />} />
				<Route path="/payments/fail" element={<PaymentFailPage />} />
				<Route path="/login/success" element={<LoginSuccess />} />
				<Route path="/change/password" element={<ChangePassword />} />
				<Route path="/admin/test" element={<Test />} />
				<Route path="/receipt/create" element={<div>영수증 생성</div>} />
				<Route path="/qr" element={<QrResolvePage />} />
			</Route>

			{/* 장바구니·주문용 Layout */}
			<Route element={<LayoutCartOrder />}>
				<Route path="/cart/main" element={<CartMain />} />
				<Route path="/orders" element={<OrderRedirect />} />
				<Route path="/orders/delivery" element={<DeliveryOrderPage />} />
				<Route path="/orders/pickup" element={<PickupOrderPage />} />
			</Route>


			<Route element={<AdminLayout />}>
				<Route path="/admin/test" element={<Test />} />
				<Route path="/admin/dashboard/main" element={<EcoStockDashboard />} />
				<Route path="/admin/dashboard/eco-stock" element={<EcoStockDashboard />} />
				<Route path="/admin/dashboard/order-product" element={<OrderProductDashboard />} />
				<Route path="/admin/dashboard/phti" element={<PhtiDashboard />} />
				<Route path="/admin/dashboard/donation" element={<DonationDashboard />} />
				<Route path="/receipt/create" element={<div>영수증 생성</div>} />
			</Route>
		</Routes>
	)
}

export default App