import apiClient from "@/api/_base/apiClient";

export const searchAllCardCompanies = async () => {
    const response = await apiClient.get("/card-companies");
    return response.data;
};
