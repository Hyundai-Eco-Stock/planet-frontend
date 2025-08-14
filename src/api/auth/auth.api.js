import apiClient from "../_base/apiClient";

export const regenerateAccessToken = async () => {
	const response = await apiClient.post('/auth/access-token/regenerate');
	return response;
}

/**
 * 카카오 회원가입 후 회원가입 폼 내용과 함께 가입 요청
 * @param {String} email 
 * @param {String} name 
 * @param {String} password
 * @param {*} profileImage 
 */
export const signUpByKakao = async (email, name, password, profileImage) => {
	const signUpData = { email, name, password };

	const multipartForm = new FormData();
	multipartForm.append(
		"signUp",
		new Blob([JSON.stringify(signUpData)], { type: "application/json" })
	);

	if (profileImage) {
		const filename = profileImage.name || "profile.jpg";
		multipartForm.append("profileImage", profileImage, filename);
	}

	await apiClient.post("/auth/signup/kakao", multipartForm, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/**
 * 로그아웃
 * - 서버: Refresh 쿠키 만료 + Redis 블랙리스트 처리
 * - 클라이언트: 상태(Zustand 등) 초기화는 호출부에서 처리
 */
export const logout = async () => {
	const res = await apiClient.post("/auth/logout");
	return res.status;
};

// 나의 정보 가져오기
// export const fetchUserInfo = async () => {
// 	try {
// 		const response = await apiClient.get("/members/personal-info");
// 		return response.data;
// 	} catch (error) {
// 		console.error("사용자 정보 조회 실패:", error);
// 		throw error;
// 	}
// };

// 로컬 로그인 요청
// export const localLogin = async (email, password) => {
// 	try {
// 		await apiClient.post("/auth/login", {
// 			email,
// 			password,
// 		});
// 	} catch (err) {
// 		console.error("로그인 실패: ", err.response.data);

// 		Swal.fire({
// 			icon: "error",
// 			title: "로그인 실패",
// 			text: "다시 시도해주세요.",
// 			timer: 1500,
// 			showConfirmButton: false
// 		});
// 		throw err;
// 	}
// };