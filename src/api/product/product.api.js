import apiClient from "@/api/_base/apiClient";

export const searchRecommendProducts = async (name, categoryId, id, size) => {
  const response = await apiClient.get("/products/recommend", {
    params: { name, categoryId, id, size },
  });
  console.log(response.data);
  return response.data;
};


export async function fetchProductsByCategory(categoryKey) {
  console.log("여기까지 왓다 !!")
  const response = await apiClient.get("/products", {
    params: { categoryId: categoryKey }
  });
  console.log(response.data);
  return response.data;
}