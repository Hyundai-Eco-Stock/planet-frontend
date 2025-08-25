import apiClient from "@/api_department_core_backend/_base/apiClient";

/**
 * 영수증 발행 이벤트 생성
 * @param {object} payload - handleSubmit에서 넘기는 영수증 정보
 * @returns 
 */
export const createOfflinePay = async (payload) => {
    const response = await apiClient.post("/offline-pays", payload);
    return response.data;
};