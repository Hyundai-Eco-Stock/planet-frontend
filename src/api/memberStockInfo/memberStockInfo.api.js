import apiClient from "@/api/_base/apiClient";

export const getPersonalStockInfo = async (ecoStockId) => {
    const response = await apiClient.get(`/portfolio/summary?ecoStockId=${ecoStockId}`);  // 또는 "/list"
    return response.data;
};