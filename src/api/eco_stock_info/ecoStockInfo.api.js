import apiClient from "@/api/_base/apiClient";


export const getAllEcoStocks = async () => {
    const response = await apiClient.get("/eco-stock/list");  // 또는 "/list"
    return response.data;
};