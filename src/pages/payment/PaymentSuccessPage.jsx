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

    let cleanNumber = orderNumber.replace(/^draft_/, '')

    if (cleanNumber.includes('_')) {
      const parts = cleanNumber.split('_')
      if (parts.length >= 2) {
        cleanNumber = parts[parts.length - 1].toUpperCase()
      }
    }

    return cleanNumber
  }

  const handleGoBack = () => {
    if (orderResult?.qrCodeData) {
      navigate('/eco-deal/main')
    } else {
      navigate('/shopping/main')
    }
  }

  // 기존 useEffect 로직 유지...
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

        const savedPaymentData = sessionStorage.getItem('paymentOrderDraft');
        if (savedPaymentData) {
          orderData = JSON.parse(savedPaymentData);
        } else {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-8 text-center">
        {/* 성공 아이콘 */}
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">결제요청 처리완료</h1>
      </div>

      {/* 구분선 */}
      <div className="border-t border-dashed border-gray-300 mx-6"></div>

      {/* 결제 정보 */}
      {!!orderResult && (
        <div className="flex-1 px-6 py-6 pb-24">
          <div className="space-y-4">
            {/* 주문번호 */}
            <div className="text-center pb-4 border-b border-gray-200">
              <p className="text-gray-600 text-sm mb-1">주문번호</p>
              <p className="font-mono text-lg font-bold text-gray-900">
                {formatOrderNumber(orderResult.orderNumber ?? orderResult.orderId)}
              </p>
            </div>

            {/* 가맹점 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">가맹점</span>
              <span className="font-medium text-sm">planet</span>
            </div>

            {/* 결제금액 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">결제금액</span>
              <span className="font-bold text-black text-lg">
                {Number(amount || 0).toLocaleString()} 원
              </span>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* 결제일시 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">결제일시</span>
              <span className="text-gray-500 text-sm">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }).replace(/\./g, '-').slice(0, -1)} {new Date().toLocaleTimeString('ko-KR', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>

            {/* 배송방식 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">배송방식</span>
              <span className="font-semibold text-sm">
                {orderResult?.qrCodeData ? '픽업' : '일반 배송'}
              </span>
            </div>

            {/* 결제수단 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">결제수단</span>
              <span className="font-semibold text-sm">{orderResult.paymentMethod ?? '카드'}</span>
            </div>
          </div>

          {/* QR 코드 (픽업 주문시만) */}
          {orderResult?.qrCodeData && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <h3 className="font-medium text-gray-900 mb-4">픽업 QR 코드</h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <img
                  src={orderResult.qrCodeData}
                  alt="픽업용 QR코드"
                  className="w-40 h-40 mx-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-gray-500 py-12 text-sm">
                  QR코드를 불러올 수 없습니다
                </div>
              </div>
              <p className="text-sm text-gray-600">
                매장 방문 시 QR 코드를 제시해 주세요
              </p>
            </div>
          )}
        </div>
      )}

      {/* 확인 버튼 - 하단 고정 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white p-4 border-t border-gray-200">
        <button
          onClick={handleGoBack}
          className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          쇼핑 계속하기
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;