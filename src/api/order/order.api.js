import apiClient from "@/api/_base/apiClient";

/**
 * 구매 확정
 */
export const confirmOrder = async (orderHistoryId, orderProductIds = []) => {
  try {
    const response = await apiClient.post(`/orders/${orderHistoryId}/confirm`, {
      orderProductIds: orderProductIds.length > 0 ? orderProductIds : undefined
    });
    
    return response.data;
  } catch (error) {
    console.error('구매 확정 API 오류:', error);
    throw error;
  }
};