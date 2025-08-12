import apiClient from "../_base/apiClient";

// 로컬 로그인 요청
export const test = async () => {
	const response = await apiClient.get("/tests");
	return response.data;
};