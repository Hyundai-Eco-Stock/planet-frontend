import './App.css'

import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { regenerateAccessToken } from './api/auth/auth.api'
import useAuthStore from '@/store/authStore'

import Header from '@/components/_layout/Header'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import LoginSuccess from '@/pages/LoginSuccess'
import SignUp from './pages/SignUp'

function App() {

	const getAccessToken = async () => {
		// access 토큰 재발급
		const accessToken = await regenerateAccessToken();
		useAuthStore.getState().setAccessToken(accessToken);
	}

	// useEffect(() => {
	// 	(getAccessToken)();
	// }, []);

	return (
		<>
			<Header />
			<Routes>
				<Route path="/" element={<Navigate to="/home" />} />
				<Route path="/home" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/login/success" element={<LoginSuccess />} />
				<Route path="/signup" element={<SignUp />} />
			</Routes>
		</>

	)
}

export default App
