import apiClient from "@/api/_base/apiClient";

export const searchTodayAllEcoDealProducts = async () => {
	const response = await apiClient.get("/eco-products/today");
	console.log("에코딜 상품 조회:", response.data);
	return response.data;
};

/* 에코딜 상품 상세 조회 */
export async function fetchEcoDealProductDetail(productId = {}) {
  const response = await apiClient.get(`/eco-products/${productId}`, {
	params: { productId }
  });
  console.log("fetchEcoDealProductDetail API 응답:", response.data);
  return response.data;
}