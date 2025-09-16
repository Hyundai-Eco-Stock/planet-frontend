import apiClient from "@/api/_base/apiClient";

export const fetchEcoStockIssuePercentageData = async () => {
	const response = await apiClient.get("/admin/eco-stock-issue-percentage");
	return response.data;
}

export const fetchEcoStockHoldingAmountDataGroupByMember = async () => {
	const response = await apiClient.get("/admin/eco-stock-issue-holdings");
	return response.data;
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

// 래플별 래플 참여 현황
export const fetchRaffleParticipationByRaffle = async () => {
	const response = await apiClient.get("/admin/raffles-participation-by-raffle");
	return response.data;
};

// 일자별 래플 참여 현황
export const fetchRaffleParticipationByDay = async () => {
	const response = await apiClient.get("/admin/raffle-participation-by-day");
	return response.data;
};

// 최근 7일 주문량
export const fetch7DayOrderCount = async () => {
	const response = await apiClient.get("/admin/7days-order-count")
	console.log(response.data);
	return response.data;
}

// 카테고리별 매출
export const fetchCategorySalesCount = async () => {
	const response = await apiClient.get("/admin/category-sales")
	console.log(response.data);
	return response.data;
}
// 테스트 알림 전송
export const testNotification = async () => {
	const response = await apiClient.post("/admin/notification/test")
	return response.data;
}
// 푸드딜 알림 전송
export const sendFoodDealNotification = async () => {
	const response = await apiClient.post("/admin/notification/food-deal")
	return response.data;
}

// 텀블러 사용 에코스톡 발급 알림 전송
export const sendTumblerUseNotification = async () => {
	const response = await apiClient.post("/admin/notification/tumbler-use")
	return response.data;
}