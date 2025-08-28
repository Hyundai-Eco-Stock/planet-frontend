import apiClient from "@/api_department_core_backend/_base/apiClient";

export const searchAllCardCompanies = async () => {
    const response = await apiClient.get("/card-companies");
    return response.data;
};
