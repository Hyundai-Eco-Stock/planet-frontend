import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../../store/orderStore';
import { usePaymentStore } from '../../store/paymentStore';
import { confirmPayment } from '../../api/payment/payment.api';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderResult, setOrderResult] = useState(null);

  const { removeOrderedProducts } = useCartStore();
  const { orderDraft, clearOrderDraft } = useOrderStore();
  const { reset: resetPayment } = usePaymentStore();

  // TossPayments 리다이렉트 파라미터
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const processedRef = useRef(null);

  // 주문번호 정리 함수
  const formatOrderNumber = (orderNumber) => {
    if (!orderNumber) return 'N/A'

    // draft_ 제거하고 언더스코어로 분리된 부분들 처리
    let cleanNumber = orderNumber.replace(/^draft_/, '') // "draft_" 접두사 제거

    // 타임스탬프_랜덤문자열 형태에서 뒤의 랜덤 문자열만 사용
    if (cleanNumber.includes('_')) {
      const parts = cleanNumber.split('_')
      if (parts.length >= 2) {
        // 마지막 부분(랜덤 문자열)만 사용하고 대문자로 변환
        cleanNumber = parts[parts.length - 1].toUpperCase()
      }
    }

    return cleanNumber
  }

  const handleGoBack = () => {
    if (orderResult?.qrCodeData) {
      navigate('/eco-deal/main')  // 픽업
    } else {
      // 일반 배송이면 쇼핑 메인으로
      navigate('/shopping/main')
    }
  }

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      alert('결제 정보가 올바르지 않습니다.');
      navigate('/cart/main');
      return;
    }

    const expected = sessionStorage.getItem('expectedAmount');
    const amountNum = parseInt(amount, 10);
    const expectedNum = expected ? parseInt(expected, 10) : null;

    if (Number.isNaN(amountNum) || (expectedNum !== null && amountNum !== expectedNum)) {
      alert('결제 금액 검증에 실패했습니다. 고객센터로 문의해 주세요.');
      navigate('/cart/main');
      return;
    }

    const key = `${paymentKey}:${orderId}:${amountNum}`;

    if (processedRef.current === key) {
      return;
    }
    processedRef.current = key;

    let active = true;

    (async () => {
      try {
        let orderData = null;

        // DeliveryOrderPage에서 저장한 데이터 확인
        const savedPaymentData = sessionStorage.getItem('paymentOrderDraft');
        if (savedPaymentData) {
          orderData = JSON.parse(savedPaymentData);
        } else {
          // fallback: orderDraft에서 데이터 추출 시도
          const products = Array.isArray(orderDraft?.products) ? orderDraft.products : [];
          orderData = {
            orderType: orderDraft?.orderType || 'DELIVERY',
            products: products.map(product => ({
              productId: product.id,
              productName: product.name || product.productName || '상품명',
              quantity: product.quantity,
              price: product.originalPrice || product.paidPrice || product.price,
              salePercent: product.salePercent || 0,
              ecoDealStatus: product.ecoDealStatus || product.isEcoDeal || false
            })),
            deliveryInfo: orderDraft?.deliveryInfo ? {
              recipientName: orderDraft.deliveryInfo.recipientName,
              recipientPhone: orderDraft.deliveryInfo.phone,
              address: orderDraft.deliveryInfo.address,
              detailAddress: orderDraft.deliveryInfo.detailAddress || '',
              zipCode: orderDraft.deliveryInfo.zipCode || '',
              deliveryMemo: orderDraft.deliveryInfo.deliveryRequest || ''
            } : null,
            pickupInfo: orderDraft?.pickupInfo || null,
            pointsUsed: orderDraft?.payment?.pointUsage || 0,
            donationAmount: orderDraft?.payment?.donationAmount || 0,
            customerName: orderDraft?.orderUser?.name || '',
            customerEmail: orderDraft?.orderUser?.email || '',
            customerPhone: orderDraft?.orderUser?.phone || ''
          };
        }

        const productsForName = Array.isArray(orderData?.products)
          ? orderData.products
          : (Array.isArray(orderDraft?.products)) ? orderDraft.products : [];

        const computedOrderName = productsForName.length > 1
          ? `${productsForName[0]?.productName ?? productsForName[0]?.name ?? '주문 상품'} 외 ${productsForName.length - 1}건`
          : (productsForName[0]?.productName ?? productsForName[0]?.name ?? '주문 상품');

        const orderName = orderData?.orderName ?? computedOrderName;

        // 백엔드 승인 요청 
        const payload = {
          paymentKey,
          orderId,
          amount: amountNum,
          orderName,
          orderType: orderData.orderType,
          products: orderData.products.map(product => ({
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            salePercent: product.salePercent,
            quantity: product.quantity,
            ecoDealStatus: product.ecoDealStatus
          })),
          deliveryInfo: orderData.deliveryInfo,
          pickupInfo: orderData.pickupInfo,
          pointsUsed: orderData.pointsUsed,
          donationAmount: orderData.donationAmount,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone
        };

        const result = await confirmPayment(payload);
        if (!active) {
          return;
        }

        setOrderResult(result?.data);

        if (orderData.products && orderData.products.length > 0) {
          removeOrderedProducts(orderData.products);
        }

        clearOrderDraft();
        resetPayment();
        sessionStorage.removeItem('expectedAmount');
        sessionStorage.removeItem('paymentOrderDraft');
      } catch (error) {
        console.error('결제 승인 중 오류:', error);
        alert('결제 승인 중 오류가 발생했습니다. 고객센터로 문의해 주세요.');
        navigate('/cart/main');
      } finally {
        if (active) setIsProcessing(false);
      }
    })();

    return () => { active = false; };
  }, [paymentKey, orderId, amount, navigate, orderDraft, removeOrderedProducts, clearOrderDraft, resetPayment]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* 성공 메시지 */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">결제 완료</h1>
          <p className="text-gray-600 text-sm">주문이 성공적으로 처리되었습니다</p>
        </div>

        {/* 주문 정보 */}
        {!!orderResult && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="space-y-4">
              {/* 주문번호 */}
              <div className="text-center pb-4 border-b">
                <p className="text-gray-600 text-sm mb-1">주문번호</p>
                <p className="font-mono text-lg font-bold text-gray-900">
                  {formatOrderNumber(orderResult.orderNumber ?? orderResult.orderId)}
                </p>
              </div>

              {/* 결제 정보 */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">결제금액</span>
                  <span className="font-semibold">{Number(amount || 0).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">배송방식</span>
                  <span className="font-semibold">
                    {orderResult?.qrCodeData ? '픽업' : '일반 배송'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제수단</span>
                  <span className="font-semibold">{orderResult.paymentMethod ?? '카드'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR 코드 (픽업 주문시만) */}
        {orderResult?.qrCodeData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-4">픽업 QR 코드</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <img
                src={orderResult.qrCodeData}
                alt="픽업용 QR코드"
                className="w-48 h-48 mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-gray-500 py-12">
                QR코드를 불러올 수 없습니다
              </div>
            </div>
            <p className="text-sm text-gray-600">
              매장 방문 시 QR 코드를 제시해 주세요
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;