import apiClient from "@/api/_base/apiClient";

export const searchRecommendProducts = async (name, categoryId, id, size) => {
  const response = await apiClient.get("/products/recommend", {
    params: { name, categoryId, id, size },
  });
  console.log("searchRecommendProducts API 응답:", response.data);
  return response.data;
};


/* 카테고리별 상품 조회 */
export async function fetchProductsByCategory(categoryId) {
  console.log("여기까지 왓다 !!")
  const response = await apiClient.get("/products", {
    params: { categoryId: categoryId }
  });
  console.log("fetchProductsByCategory API 응답:", response.data);
  return response.data;
}

/* 상품 검색 */
export async function searchProducts(query, categoryId, { signal } = {}) {
  console.log("searchProducts called with query:", query, "and categoryId:", categoryId);
  const response = await apiClient.get("/products/search", {
    params: { searchKeyword: query, categoryId },
    signal,
  });
  console.log("searchProducts API 응답:", response.data);
  return response.data;
}

/* 카테고리 목록 조회 */
export async function fetchCategories({ signal } = {}) {
  const response = await apiClient.get("/products/categories", {
    signal,
  });
  console.log("fetchCategories API 응답:", response.data);
  return response.data;
}

/* 상품 상세 조회 */
export async function fetchProductDetail(productId, { signal } = {}) {
  const response = await apiClient.get(`/products/${productId}`, {
    params: { productId },
    signal,
  });
  console.log("fetchProductDetail API 응답:", response.data);
  return response.data;
}