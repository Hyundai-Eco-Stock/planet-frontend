import apiClient from "@/api/_base/apiClient";

// 로컬 로그인 요청
export const searchTodayAllEcoDealProducts = async () => {
	const response = await apiClient.get("/eco-products/today");
	return response.data;
};