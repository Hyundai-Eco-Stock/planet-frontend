import apiClient from "@/api/_base/apiClient";

export const searchRecommendProducts = async (name, categoryId, id, size) => {
  const response = await apiClient.get("/products/recommend", {
    params: { name, categoryId, id, size },
  });
  return response.data;
};
