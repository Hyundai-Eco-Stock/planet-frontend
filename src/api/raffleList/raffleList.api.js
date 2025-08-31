import apiClient from "@/api/_base/apiClient";


export const getRaffleList = async () => {
    const response = await apiClient.get(`/raffles`);  // 또는 "/list"
    return response.data;
};