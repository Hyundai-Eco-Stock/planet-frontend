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

// PHTI 유형별 사용자 분포
export const fetchMemberPercentageByPhti = async () => {
	const response = await apiClient.get("/admin/member-percentage-by-phti");
	return response.data;
};

// PHTI 유형별 주문/교환 패턴
export const fetchIssueAndOrderPatternsByPhti = async () => {
	const response = await apiClient.get("/admin/issue-and-order-patterns-by-phti");
	return response.data;
};

// 날짜별 기부 금액 추이
export const fetchDonationAmountsByDay = async () => {
	const response = await apiClient.get("/admin/donation-amounts-by-day");
	return response.data;
};

// 사용자별 기부 참여율
export const fetchDonatorPercentage = async () => {
	const response = await apiClient.get("/admin/donator-percentage");
	return response.data;
};

export const testNotification = async () => {
	const response  = await apiClient.post("/admin/notification/test")
	return response.data;
}