import apiClient from "@/api_department_core_backend/_base/apiClient";

export const searchAllShops = async () => {
    const response = await apiClient.get("/department-stores/shops");
    return response.data;
};

export const searchAllShopProducts = async (shopId) => {
    const response = await apiClient.get(`/department-stores/shops/${shopId}/products`);
    return response.data;
};