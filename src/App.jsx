import './App.css'

import { Navigate, Route, Routes } from 'react-router-dom'

import { regenerateAccessToken } from './api/auth/auth.api'
import useAuthStore from '@/store/authStore'

import Header from '@/components/_layout/Header'
import Footer from '@/components/_layout/Footer'

// 홈
import HomeMain from '@/pages/home/Home'

// 인증/인가
import LoginSuccess from '@/pages/auth/LoginSuccess'
import SignUp from '@/pages/auth/SignUp'
import Login from '@/pages/auth/Login'

// 쇼핑
import ShoppingMain from '@/pages/shopping/ShoppingMain'

// 에코 스톡
import EcoStockMain from '@/pages/eco_stock/EcoStockMain'

// 마이 페이지
import MyPageMain from '@/pages/mypage/MyPageMain'

function App() {

	// access 토큰 재발급
	// const getAccessToken = async () => {
	// 	const accessToken = await regenerateAccessToken();
	// 	useAuthStore.getState().setAccessToken(accessToken);
	// }
	// useEffect(() => {
	// 	(getAccessToken)();
	// }, []);

	return (
		<div className='w-full h-full flex flex-col'>
			<Header />
			<main className='flex-grow'>
				<Routes>
					{/* 홈 */}
					<Route path="/" element={<Navigate to="/home" />} />
					<Route path="/home" element={<Navigate to="/home/main" />} />
					<Route path="/home/main" element={<HomeMain />} />

					{/* 인증/인가 */}
					<Route path="/login" element={<Login />} />
					<Route path="/login/success" element={<LoginSuccess />} />
					<Route path="/signup" element={<SignUp />} />

					{/* 쇼핑 */}
					<Route path="/shopping" element={<Navigate to="/shopping/main" />} />
					<Route path="/shopping/main" element={<ShoppingMain />} />

					{/* 에코 스톡 */}
					<Route path="/eco-stock" element={<Navigate to="/eco-stock/main" />} />
					<Route path="/eco-stock/main" element={<EcoStockMain />} />

					{/* 마이 페이지 */}
					<Route path="/my-page" element={<Navigate to="/my-page/main" />} />
					<Route path="/my-page/main" element={<MyPageMain />} />
				</Routes>
			</main>
			<Footer />
		</div>

	)
}

export default App
