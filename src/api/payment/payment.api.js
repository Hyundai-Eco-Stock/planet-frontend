import apiClient from "@/api/_base/apiClient";

// 결제 승인
export const confirmPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/payments/confirm', {
      // TossPayments 정보
      paymentKey: paymentData.paymentKey,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      
      // paymentStore에서 변환된 데이터 사용
      orderName: paymentData.orderName,
      products: paymentData.products,
      deliveryInfo: paymentData.deliveryInfo,
      pickupInfo: paymentData.pickupInfo,
      pointsUsed: paymentData.pointsUsed,
      donationAmount: paymentData.donationAmount,
      orderType: paymentData.orderType,
      
      // 사용자 정보
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      customerPhone: paymentData.customerPhone
    });
    
    return response.data;
  } catch (error) {
    console.error('결제 승인 API 오류:', error);
    throw error; 
  }
};

// 결제 전체 취소
export const cancelEntireOrder = async (orderHistoryId, cancelReason = '고객 요청') => {
  try {
    const response = await apiClient.post(`/payments/${orderHistoryId}/cancel`, {
      cancelReason,
      cancelType: 'CANCELED'
    });
    
    return response.data;
  } catch (error) {
    console.error('주문 전체 취소 API 오류:', error);
    throw error;
  }
};

// 결제 부분 취소 
export const cancelPartialOrder = async (orderHistoryId, orderProductIds, reason = '고객 요청', refundDonation = false) => {
  try {
    const cancelItems = Array.isArray(orderProductIds) 
      ? orderProductIds.map(id => ({ orderProductId: id }))
      : [{ orderProductId: orderProductIds }];
    
    console.log('부분 취소 요청 데이터:', {
      cancelItems,
      cancelReason: reason,
      refundDonation
    });
    
    const response = await apiClient.post(`/payments/${orderHistoryId}/cancel/partial`, {
      cancelItems: cancelItems,
      cancelReason: reason,
      refundDonation: refundDonation
    });
    
    return response.data;
  } catch (error) {
    console.error('주문 부분 취소 API 오류:', error);
    throw error;
  }
};
