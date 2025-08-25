import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useOrderStore from '../../store/orderStore'
import useCartStore from '../../store/cartStore'
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk'

// 컴포넌트들
import OrderProductList from '../../components/order/OrderProductList'
import OrderUserInfo from '../../components/order/OrderUserInfo'
import PickupStoreInfo from '../../components/order/PickupStoreInfo'
import PointUsageForm from '../../components/order/PointUsageForm'
import DonationForm from '../../components/order/DonationForm'
import PaymentSummary from '../../components/payment/PaymentSummary'

const PickupOrderPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const { 
    orderDraft, 
    createOrderDraft, 
    updatePointUsage,
    updateDonationAmount,
    updateOrderDraft,
    clearOrderDraft,
    isLoading 
  } = useOrderStore()
  
  const { pickupCart } = useCartStore()
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 결제위젯 refs
  const widgetRef = useRef(null)
  const methodsRef = useRef(null)

  // 환경변수에서 Toss clientKey 직접 사용
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY

  useEffect(() => {
    const initializeOrder = async () => {
      // CartMain에서 넘어온 데이터 확인
      const locationData = location.state
      const selectedProducts = locationData?.products || pickupCart
      const deliveryType = locationData?.deliveryType || 'PICKUP'
      
      // deliveryType이 PICKUP이 아니면 잘못된 접근
      if (deliveryType !== 'PICKUP') {
        alert('잘못된 접근입니다.')
        navigate('/cart/main')
        return
      }
      
      if (selectedProducts.length === 0) {
        alert('주문할 상품이 없습니다.')
        navigate('/cart/main')
        return
      }
      
      // 장바구니 → 주문서 데이터 변환
      const convertedProducts = selectedProducts.map(product => ({
        ...product,
        ecoDealStatus: product.isEcoDeal || false, 
        salePercent: product.salePercent || 0
      }))
      
      // 가격 계산
      const productTotal = convertedProducts.reduce((total, product) => {
        const finalPrice = product.ecoDealStatus && product.salePercent > 0
          ? product.price * (1 - product.salePercent / 100)  // 할인 적용
          : product.price  // 일반 가격
        return total + (finalPrice * product.quantity)
      }, 0)
      
      // 총 할인 금액 계산 
      const discountAmount = convertedProducts.reduce((total, product) => {
        if (product.ecoDealStatus && product.salePercent > 0) {
          const discount = product.price * (product.salePercent / 100) * product.quantity
          return total + discount
        }
        return total
      }, 0)
      
      // 주문서 생성 
      const cartData = {
        selectedProducts: convertedProducts.map(product => ({
          ...product,
          originalPrice: product.price,
          discountAmount: product.ecoDealStatus && product.salePercent > 0 
            ? product.price * (product.salePercent / 100) * product.quantity 
            : 0,
          paidPrice: product.ecoDealStatus && product.salePercent > 0
            ? product.price * (1 - product.salePercent / 100)
            : product.price
        })),
        orderInfo: {
          totalPrice: productTotal,
          discountAmount: discountAmount
        }
      }
      
      await createOrderDraft(cartData, 'PICKUP')
    }
    
    initializeOrder()
  }, [location.state, pickupCart, navigate, createOrderDraft])

  // 결제위젯 렌더링
  useEffect(() => {
    if (!clientKey || !orderDraft?.payment?.finalAmount) return

    let mounted = true
    ;(async () => {
      try {
        // customerKey: 유저 식별자
        const customerKey =
          (orderDraft?.orderUser?.email && orderDraft.orderUser.email.trim()) ||
          orderDraft?.orderUser?.name ||
          'guest'

        const widget = await loadPaymentWidget(clientKey, customerKey)
        if (!mounted) return
        widgetRef.current = widget

        // 결제수단 영역 렌더 (전체 위젯으로 표시)
        methodsRef.current = widget.renderPaymentMethods(
          '#payment-widget',
          { value: orderDraft.payment.finalAmount, currency: 'KRW' },
          { variantKey: 'DEFAULT' }
        )
      } catch {
        console.error('결제 위젯 렌더 실패')
      }
    })()

    return () => { mounted = false }
  }, [clientKey, orderDraft?.payment?.finalAmount, orderDraft?.orderUser?.email, orderDraft?.orderUser?.name])

  // 금액 변경 시 위젯 금액 동기화
  useEffect(() => {
    if (!methodsRef.current || !orderDraft?.payment?.finalAmount) return
    try {
      methodsRef.current.updateAmount(orderDraft.payment.finalAmount, 'KRW')
    } catch (error) {
      // 위젯이 아직 준비되지 않은 경우 - 다음 렌더링에서 처리됨
      console.debug('위젯 업데이트 실패 (정상적인 초기화 과정):', error.message)
    }
  }, [orderDraft?.payment?.finalAmount])

  // 뒤로가기 (장바구니로)
  const handleGoBack = () => {
    if (confirm('주문서 작성을 취소하고 장바구니로 돌아가시겠습니까?')) {
      clearOrderDraft()
      navigate('/cart/main')
    }
  }

  // 기부 금액 자동 계산 (1000 미만 단위로 맞추기)
  const calculateRecommendedDonation = () => {
    if (!orderDraft) return 0
    
    const currentAmount = orderDraft.payment.productTotal - orderDraft.payment.discountAmount - orderDraft.payment.pointUsage
    const remainder = currentAmount % 1000

    return remainder > 0 ? (1000 - remainder) : 0
  }

  // 결제하기 버튼 클릭
  const handlePayment = async () => {
    if (!orderDraft) return
    
    // 유효성 검사 (픽업은 매장 정보만 확인)
    const validation = validateOrder()
    if (!validation.isValid) {
      alert(validation.message)
      return
    }

    const amount = orderDraft.payment?.finalAmount ?? 0
    if (!amount || amount <= 0) {
      alert('유효하지 않은 결제 금액입니다.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 주문서 최종 업데이트
      updateOrderDraft({
        pickupInfo: orderDraft.pickupInfo,
        payment: {
          ...orderDraft.payment,
          finalAmount: amount,
        },
      })

      // 성공 페이지 금액 검증용
      sessionStorage.setItem('expectedAmount', String(amount))

      // 결제위젯 인스턴스 확보
      let widget = widgetRef.current
      if (!widget) {
        const customerKey =
          (orderDraft?.orderUser?.email && orderDraft.orderUser.email.trim()) ||
          orderDraft?.orderUser?.name ||
          'guest'
        widget = await loadPaymentWidget(clientKey, customerKey)
        widgetRef.current = widget
      }

      // methods 영역이 이미 렌더링 되어 있지 않다면 최소 렌더
      if (!methodsRef.current) {
        methodsRef.current = widget.renderPaymentMethods(
          '#payment-widget',
          { value: amount, currency: 'KRW' },
          { variantKey: 'DEFAULT' }
        )
      } else {
        try {
          methodsRef.current.updateAmount(amount, 'KRW')
        } catch {}
      }

      const digitsOnlyPhone = String(orderDraft?.orderUser?.phone || '')
        .replace(/^\+?82/, '0')
        .replace(/\D/g, '')

      // 결제위젯으로 바로 결제창 오픈
      await widget.requestPayment({
        orderId: orderDraft.orderId || `PICKUP-${Date.now()}`, // 픽업 주문 구분
        orderName:
          orderDraft.products.length > 1
            ? `${orderDraft.products[0].name} 외 ${orderDraft.products.length - 1}건`
            : (orderDraft.products[0]?.name || '주문 상품'),
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
        customerEmail: orderDraft?.orderUser?.email || '',
        customerName: orderDraft?.orderUser?.name || '',
        ...(digitsOnlyPhone && { customerMobilePhone: digitsOnlyPhone }),
      })

    } catch (error) {
      console.error('결제 처리 중 오류:', error)
      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 주문 유효성 검사 (픽업은 매장 정보만)
  const validateOrder = () => {
    if (!orderDraft.pickupInfo || !orderDraft.pickupInfo.storeGroups || orderDraft.pickupInfo.storeGroups.length === 0) {
      return { isValid: false, message: '픽업 매장을 선택해주세요.' }
    }
    return { isValid: true }
  }

  if (isLoading || !orderDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">주문서를 준비하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={handleGoBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">주문서</h1>
              <span className="text-sm text-gray-500">픽업 배송</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* 주문 상품 목록 */}
        <OrderProductList products={orderDraft.products} />

        {/* 픽업 매장 정보 */}
        <PickupStoreInfo 
          storeGroups={orderDraft.pickupInfo?.storeGroups || []}
        />

        {/* QR 코드 안내 (백엔드 연동 전 임시) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-blue-800 font-medium">픽업 안내</h3>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 결제 완료 후, QR 코드가 생성됩니다.</p>
            <p>• 선택한 매장에서 QR 코드를 제시하시면 상품을 받으실 수 있습니다.</p>
            <p>• 픽업 가능 시간: 매장 운영시간 내</p>
          </div>
        </div>

        {/* 주문자 정보 */}
        <OrderUserInfo userInfo={orderDraft.orderUser} />

        {/* 포인트 사용 */}
        <PointUsageForm
          availablePoint={orderDraft.userPoint || 0}
          currentUsage={orderDraft.payment.pointUsage}
          maxUsage={orderDraft.payment.finalAmount}
          onUpdate={updatePointUsage}
        />

        {/* 기부 옵션 */}
        <DonationForm
          recommendedAmount={calculateRecommendedDonation()}
          currentAmount={orderDraft.payment.donationAmount}
          onUpdate={updateDonationAmount}
        />

        {/* 결제 위젯 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div id="payment-widget" />
        </div>

        {/* 결제 금액 요약 */}
        <PaymentSummary payment={orderDraft.payment} />
      </div>

      {/* 하단 고정 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="max-w-4xl mx-auto p-4">
          <button
            onClick={handlePayment}
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                처리 중...
              </div>
            ) : (
              `${orderDraft.payment.finalAmount.toLocaleString()}원 결제하기`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PickupOrderPage