import apiClient from "@/api/_base/apiClient";

export const getMemberStockInfoAll = async () => {
  const response = await apiClient.get(`/portfolio/summaries`);
  return response.data;
};