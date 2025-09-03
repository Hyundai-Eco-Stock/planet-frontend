import apiClient from "@/api/_base/apiClient";

export const fetchEcoStockIssuePercentageData = async () => {
	const response = await apiClient.get("/admin/eco-stock-issue-percentage");
	return response;
}

export const fetchEcoStockHoldingAmountDataGroupByMember = async () => {
	const response = await apiClient.get("/admin/eco-stock-issue-holdings");
	return response;
}
