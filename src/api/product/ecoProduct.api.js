import apiClient from "@/api/_base/apiClient";

export const searchTodayAllEcoDealProducts = async () => {
	const response = await apiClient.get("/eco-products/today");
	console.log("에코딜 상품 조회:", response.data);
	return response.data;
};