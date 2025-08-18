import apiClient from "@/api/_base/apiClient";

export const searchTodayAllEcoDealProducts = async () => {
	const response = await apiClient.get("/eco-products/today");
	return response.data;
};