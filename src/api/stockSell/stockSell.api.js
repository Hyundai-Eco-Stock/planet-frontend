import apiClient from "@/api/_base/apiClient";

export const stockSell = async (sellStockRequest) => {
    const response = await apiClient.post(`/portfolio/stock/sell`,sellStockRequest);  // 또는 "/list"
    return response.data;
};