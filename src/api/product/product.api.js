import apiClient from "@/api/_base/apiClient";

export const searchRecommendProducts = async (name, categoryId, id, size) => {
  const response = await apiClient.get("/products/recommend", {
    params: { name, categoryId, id, size },
  });
  console.log(response.data);
  return response.data;
};


/* 카테고리별 상품 조회 */
export async function fetchProductsByCategory(categoryKey) {
  console.log("여기까지 왓다 !!")
  const response = await apiClient.get("/products", {
    params: { categoryId: categoryKey }
  });
  console.log(response.data);
  return response.data;
}

/* 상품 검색 */
export async function searchProducts(query, { signal } = {}) {
  const url = `/products/search?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`검색 실패: ${res.status}`);
  return res.json();
}

/* 카테고리 목록 조회 */
export async function fetchCategories({ signal } = {}) {
  const response = await apiClient.get("/products/categories", {
    signal,
  });
  return response.data;
}