import apiClient from "@/api/_base/apiClient";

export const regenerateAccessToken = async () => {
	const response = await apiClient.post('/auth/access-token/regenerate');
	return response;
}

export const localLogin = async (email, password) => {
	const response = await apiClient.post('/auth/login', { email, password });
	return response;
}

/**
 * 카카오 회원가입 후 회원가입 폼 내용과 함께 가입 요청
 * @param {String} email 
 * @param {String} name 
 * @param {String} password
 * @param {*} profileImage 
 */
export const signUpByKakao = async ({
	email,
	name,
	password,
	profileFile,
	sex,
	birth,
	address,
	detailAddress,
}) => {
	const signUpData = { email, name, password, sex, birth, address, detailAddress, };

	const multipartForm = new FormData();
	multipartForm.append(
		"signUp",
		new Blob([JSON.stringify(signUpData)], { type: "application/json" })
	);

	if (profileFile) {
		const filename = profileFile.name || "profile.jpg";
		multipartForm.append("profileImage", profileFile, filename);
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

export const postPasswordChangeMail = async ({ email }) => {
	const res = await apiClient.post("/auth/password-change-mail", { email });
	return res.status;
};

export const validatePasswordChangeToken = async ({ token }) => {
	const res = await apiClient.post("/auth/password-change-token/valid", { token });
	return res.status;
};

export const changePassword = async ({ token, password }) => {
	const res = await apiClient.post("/auth/change-password", { token, password });
	return res.status;
};