import apiClient from "@/api/_base/apiClient";


export const registerFcmToken = async (token) => {
    const response = await apiClient.post("/fcm-tokens", { token });
    return response.data;
};