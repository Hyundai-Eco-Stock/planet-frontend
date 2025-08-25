import apiClient from "@/api/_base/apiClient";


export const getEcoStockHistory = async (ecoStockId) => {
    const response = await apiClient.get(`/eco-stock/history?ecoStockId=${ecoStockId}`);
    return response.data;
};