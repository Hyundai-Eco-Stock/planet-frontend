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
export const cancelPayment = async (orderId, cancelReason) => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, {
      cancelReason,
      cancelType: 'CANCELED'
    });
    
    return response.data;
  } catch (error) {
    console.error('결제 취소 API 오류:', error);
    throw error;
  }
};

// 결제 부분 취소 
export const partialCancelPayment = async (orderId, cancelData) => {
  // cancelData 구조 예상:
  // {
  //   reason: string,
  //   cancelItems: [{ productId, quantity, amount }],
  //   totalCancelAmount: number,
  //   shouldRefundDonation: boolean
  // }
  
  const totalOrderAmount = cancelData.originalAmount || 0;
  const cancelAmount = cancelData.totalCancelAmount || 0;
  
  // 포인트는 취소 금액 비례로 환불
  const refundPoints = totalOrderAmount > 0 
    ? Math.floor((cancelData.originalPointsUsed || 0) * (cancelAmount / totalOrderAmount))
    : 0;
  
  // 기부금은 사용자 선택에 따라
  const refundDonation = cancelData.shouldRefundDonation 
    ? (cancelData.originalDonationAmount || 0)
    : 0;

  try {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, {
      cancelReason: cancelData.reason,
      cancelType: 'PARTIAL_CANCELED',
      cancelAmount: cancelAmount,
      cancelItems: cancelData.cancelItems,
      refundPoints,
      refundDonation
    });
    
    return response.data;
  } catch (error) {
    console.error('부분 결제 취소 API 오류:', error);
    throw error;
  }
};