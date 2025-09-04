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
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">결제가 완료되었습니다!</h1>
          <p className="text-gray-600 mb-8">
            주문이 성공적으로 처리되었습니다.<br />
            빠른 시일 내에 배송/픽업 준비를 완료하겠습니다.
          </p>

          {!!orderResult && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
              {/* 주문번호 - 별도 영역 */}
              <div className="bg-white rounded-lg p-4 border">
                <span className="text-gray-600 text-sm font-medium block mb-2">주문번호</span>
                <div className="font-mono text-sm font-bold text-gray-900 break-all leading-relaxed bg-gray-50 p-3 rounded">
                  {orderResult.orderNumber ?? orderResult.orderId}
                </div>
              </div>

              {/* 나머지 정보들 - 그리드 레이아웃 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs block mb-1">결제금액</span>
                  <p className="font-bold text-green-600 text-lg">
                    {Number(amount || 0).toLocaleString()}원
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs block mb-1">배송방식</span>
                  <p className="font-medium text-gray-900">
                    {orderResult?.qrCodeData ? '픽업' : '일반 배송'}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs block mb-1">결제수단</span>
                  <p className="font-medium text-gray-900">{orderResult.paymentMethod ?? '신용카드'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 픽업 주문 QR 코드 */}
          {orderResult?.qrCodeData && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4 text-center">픽업 안내</h3>
              
              {/* QR 코드 */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <img
                    src={orderResult.qrCodeData}
                    alt="픽업용 QR코드"
                    className="w-48 h-48 mx-auto"
                    onError={(e) => {
                      console.error('QR 이미지 로드 실패:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden text-gray-500 text-center py-12">
                    QR코드를 불러올 수 없습니다
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-blue-700 font-medium">
                    매장 방문 시 이 QR코드를 제시해 주세요
                  </p>
                  <p className="text-xs text-blue-600">
                    화면을 캡처하여 저장하세요
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/home/main')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              쇼핑 계속하기
            </button>
          </div>

          {/* 추후 주문 내역 확인 기능을 위한 공간 */}
          <div className="mt-4 text-sm text-gray-500">
            {/* 주문 내역 확인 기능은 추후 추가 예정 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;