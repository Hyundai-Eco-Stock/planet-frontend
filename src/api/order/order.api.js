import apiClient from "@/api/_base/apiClient";

export const fetchMyOrders = async () => {
	const response = await apiClient.get("/orders/me");
	console.log("내 주문내역 조회:", response.data);
	return response.data;
};


export const fetchMyEcoDeals = async () => {
	const response = await apiClient.get("orders/eco-deals/me");
	console.log("내 에코딜 조회:", response.data);
	return response.data;
};
