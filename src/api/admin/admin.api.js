import apiClient from "@/api/_base/apiClient";

export const fetchEcoStockIssuePercentageData = async () => {
	const response = await apiClient.get("/admin/eco-stock-issue-percentage");
	return response;
}

export const fetchEcoStockHoldingAmountDataGroupByMember = async () => {
	const response = await apiClient.get("/admin/eco-stock-issue-holdings");
	return response;
}

// 일별 주문/매출
export const fetchProductOrderDataGroupByDay = async () => {
	const response = await apiClient.get("/admin/product-orders-group-by-day");
	return response.data;
};

// 카테고리별 판매 비율
export const fetchProductOrderDataGroupByCategory = async () => {
	const response = await apiClient.get("/admin/product-orders-group-by-category");
	return response.data;
};