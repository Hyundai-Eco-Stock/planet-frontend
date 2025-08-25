import { create } from 'zustand';

export const usePaymentStore = create((set) => ({
  // 결제 정보
  paymentData: null,
  isProcessing: false,

  // TossPayments 설정
  clientKey: import.meta.env.VITE_TOSS_CLIENT_KEY,
  
  // 결제 데이터 설정
  setPaymentData: (data) => set({ paymentData: data }),
  
  // 결제 처리 상태
  setProcessing: (isProcessing) => set({ isProcessing }),
  
  // 주문서 데이터를 결제 데이터로 변환
  transformOrderToPayment: (orderData) => {
    const { 
      products = [], 
      payment = {},  
      orderType, 
      deliveryInfo,
      pickupInfo,
      orderUser = {}
    } = orderData || {};

    // 주문번호 생성 
    const generateOrderId = () => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 8).toUpperCase();
      return `ORD_${timestamp}_${random}`;
    };

    const orderName =
      products.length > 1
        ? `${products[0]?.name ?? '상품'} 외 ${products.length - 1}건`
        : products[0]?.name ?? '상품';

    return {
      // TossPayments 필수 데이터
      orderId: generateOrderId(),
      orderName,
      amount: payment.finalAmount ?? 0,
      
      // 상품 정보
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        discountAmount: product.ecoDealStatus 
          ? Math.round(product.price * (product.salePercent / 100) * product.quantity)
          : 0,
        quantity: product.quantity,
        totalAmount: product.totalPrice, 
        imageUrl: product.imageUrl
      })),
      
      // 결제 상세 
      totalAmount: payment.productTotal ?? 0,
      discountAmount: payment.discountAmount ?? 0,
      pointsUsed: payment.pointUsage ?? 0,
      donationAmount: payment.donationAmount ?? 0,
      finalAmount: payment.finalAmount ?? 0,
      
      // 배송 정보
      orderType, 
      deliveryInfo: orderType === 'DELIVERY' ? deliveryInfo : null,
      pickupInfo: orderType === 'PICKUP' ? pickupInfo : null,
      
      // 사용자 정보
      customerName: orderUser?.name ?? '',
      customerEmail: orderUser?.email ?? '',
      customerPhone: orderUser?.phone ?? '',
      
      // 성공/실패 URL (환경변수 기반)
      successUrl: import.meta.env.VITE_TOSS_SUCCESS_URL || `${window.location.origin}/payments/success`,
      failUrl: import.meta.env.VITE_TOSS_FAIL_URL || `${window.location.origin}/payments/fail`,
    };
  },
  
  // 초기화
  reset: () => set({
    paymentData: null,
    isProcessing: false,
  }),
}));
