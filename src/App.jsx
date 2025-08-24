import './App.css'

import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Header from '@/components/_layout/Header'
import HeaderWithBack from './components/_layout/HeaderWithBack'
import Footer from '@/components/_layout/Footer'

// -------------------------- 라우팅 시작 --------------------------
// 홈
import HomeMain from '@/pages/home/Home'

// 인증/인가
import Login from '@/pages/auth/Login'
import LoginSuccess from '@/pages/auth/LoginSuccess'
import OAuthSignUp from '@/pages/auth/OAuthSignUp'
import LocalSignUp from '@/pages/auth/LocalSignUp'

// 쇼핑
import ShoppingMain from '@/pages/shopping/ShoppingMain'

// 에코 스톡
import EcoStockMain from '@/pages/eco_stock/EcoStockMain'

// 마이 페이지
import MyPageMain from '@/pages/mypage/MyPageMain'

// 에코스톡 인증
import EcoStockCertificate from '@/pages/eco_stock_certificate/EcoStockCertificate'
import TumblerCertificate from '@/pages/eco_stock_certificate/TumblerCertificate'
import VolunteerWorkCertificate from '@/pages/eco_stock_certificate/VolunteerWorkCertificate'
import PaperBagNoUseCertificate from '@/pages/eco_stock_certificate/PaperBagNoUseCertificate'

// 영수증
import OfflinePayCreate from '@/pages/offline_pay/OfflinePayCreate'

// 장바구니
import CartMain from '@/pages/cart/CartMain'

// 주문
import DeliveryOrderPage from '@/pages/order/DeliveryOrderPage'
import PickupOrderPage from '@/pages/order/PickupOrderPage'

// 결제
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage'
import PaymentFailPage from './pages/payment/PaymentFailPage'

const OrderRedirect = () => {
  const location = useLocation()
  const deliveryType = location.state?.deliveryType || 'DELIVERY'
  
  if (deliveryType === 'PICKUP') {
    return <Navigate to="/orders/pickup" state={location.state} replace />
  }
  return <Navigate to="/orders/delivery" state={location.state} replace />
}

// -------------------------- 라우팅 끝 --------------------------

function App() {
  const location = useLocation();

  // 뒤로가기 헤더로 보이게 할 경로
  const showBackButtonHeaderPaths = [
    "/receipt/create",
    "/eco-stock/certificate/tumbler",
    "/eco-stock/certificate/electronic-car-parking",
    "/eco-stock/certificate/paper-bag-no-use",
    "/offline-pay/create",
  ];
  const showBackButtonHeader = showBackButtonHeaderPaths.includes(location.pathname);

  // 푸터 안보이게 할 경로 
  const hideFooterPaths = [
    "/signup/local",
    "/login",
    "/offline-pay/create",
    "/cart/main",
    "/orders/delivery",
    "/orders/pickup",
  ];
  const hideFooter = hideFooterPaths.includes(location.pathname);

  // 헤더를 완전히 숨길 경로들 (주문서 페이지는 자체 헤더 사용)
  const hideHeaderPaths = [
    "/orders/delivery",
    "/orders/pickup",
    "/payments/success",
    "/payments/fail",
  ];
  const hideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <div className='w-full h-full flex flex-col'>
      {/* 주문서 페이지에서는 헤더 완전 숨김 */}
      {!hideHeader && (
        showBackButtonHeader
          ? <HeaderWithBack />
          : <Header />
      )}

      <main className={`flex-grow ${hideHeader ? '' : 'px-2'}`}>
        <Routes>
          {/* 홈 */}
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Navigate to="/home/main" />} />
          <Route path="/home/main" element={<HomeMain />} />

          {/* 인증/인가 */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/signup/oauth" element={<OAuthSignUp />} />
          <Route path="/signup/local" element={<LocalSignUp />} />

          {/* 쇼핑 */}
          <Route path="/shopping" element={<Navigate to="/shopping/main" />} />
          <Route path="/shopping/main" element={<ShoppingMain />} />

          {/* 에코 스톡 */}
          <Route path="/eco-stock" element={<Navigate to="/eco-stock/main" />} />
          <Route path="/eco-stock/main" element={<EcoStockMain />} />
          <Route path="/eco-stock/certificate" element={<EcoStockCertificate />} />
          <Route path="/eco-stock/certificate/tumbler" element={<TumblerCertificate />} />
          <Route path="/eco-stock/certificate/paper-bag-no-use" element={<PaperBagNoUseCertificate />} />
          <Route path="/eco-stock/certificate/volunteer-work" element={<VolunteerWorkCertificate />} />

          {/* 장바구니 */}
          <Route path="/cart" element={<Navigate to="/cart/main" />} />
          <Route path="/cart/main" element={<CartMain />} />

          {/* 주문 */}
          <Route path="/orders" element={<OrderRedirect />} />
          <Route path="/orders/delivery" element={<DeliveryOrderPage />} />
          <Route path="/orders/pickup" element={<PickupOrderPage />} />

          {/* 결제 */}
          <Route path="/payments/success" element={<PaymentSuccessPage />} />
          <Route path="/payments/fail" element={<PaymentFailPage />} />

          {/* 마이 페이지 */}
          <Route path="/my-page" element={<Navigate to="/my-page/main" />} />
          <Route path="/my-page/main" element={<MyPageMain />} />

          {/* 영수증 생성 페이지 */}
          <Route path="/offline-pay/create" element={<OfflinePayCreate />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

export default App