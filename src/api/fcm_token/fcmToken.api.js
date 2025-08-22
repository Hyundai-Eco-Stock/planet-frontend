import apiClient from "@/api/_base/apiClient";


export const registerFcmToken = async (token) => {
    console.log("FCM 토큰 등록 요청 보냄");
    const response = await apiClient.post("/fcm-tokens", { token });
    return response.data;
};