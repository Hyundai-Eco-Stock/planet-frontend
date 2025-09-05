import apiClient from "@/api/_base/apiClient";

export const getRaffleEntryStatus = async (raffleId) => {
  const response = await apiClient.get(`/raffles/${raffleId}/entry`);
  return response.data;
};