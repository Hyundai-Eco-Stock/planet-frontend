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
// -------------------------- 라우팅 끝 --------------------------

function App() {
  const location = useLocation();

  // 뒤로가기 헤더로 보이게 할 경로
  const showBackButtonHeaderPaths = [
    "/receipt/create",
    "/eco-stock/certificate/tumbler",
    "/eco-stock/certificate/electronic-car-parking",
    "/eco-stock/certificate/paper-bag-no-use",
  ];
  const showBackButtonHeader = showBackButtonHeaderPaths.includes(location.pathname);

  // 푸터 안보이게 할 경로 
  const hideFooterPaths = [
    "/signup/local",
    "/login",
  ];
  const hideFooter = hideFooterPaths.includes(location.pathname);

  return (
    <div className='w-full h-full flex flex-col'>
      {
        showBackButtonHeader
          ? <HeaderWithBack />
          : <Header />
      }
      
      
      <main className='flex-grow px-2'>
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
