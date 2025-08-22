import apiClient from "@/api/_base/apiClient";

export const searchAllDepartmentStore = async () => {
    const response = await apiClient.get("/department-stores");
    return response.data;
};