import apiClient from "@/api/_base/apiClient";


export const getRaffleDetail = async (raffleId) => {
    const response = await apiClient.get(`/raffles/${raffleId}`);  // 또는 "/list"
    return response.data;
};