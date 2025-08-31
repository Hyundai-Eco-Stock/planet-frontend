import apiClient from "@/api/_base/apiClient";

export const raffleParticipate = async (raffleId) => {
  const response = await apiClient.post(`/raffles/${raffleId}/participants`);
  return response.data;
};