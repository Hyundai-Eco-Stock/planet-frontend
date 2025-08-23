import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useOrderStore from '../../store/orderStore'
import useCartStore from '../../store/cartStore'

// 컴포넌트들
import OrderProductList from '../../components/order/OrderProductList'
import OrderUserInfo from '../../components/order/OrderUserInfo'
import PickupStoreInfo from '../../components/order/PickupStoreInfo'
import PointUsageForm from '../../components/order/PointUsageForm'
import DonationForm from '../../components/order/DonationForm'
import PaymentSummary from '../../components/order/PaymentSummary'

const PickupOrderPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const { 
    orderDraft, 
    createOrderDraft, 
    updatePointUsage,
    updateDonationAmount,
    clearOrderDraft,
    isLoading 
  } = useOrderStore()
  
  const { pickupCart } = useCartStore()
  
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      
      // 주문서 생성 
      const cartData = {
        selectedProducts: convertedProducts,
        orderInfo: {
          totalPrice: productTotal,
          discountAmount: 0  
        }
      }
      
      await createOrderDraft(cartData, 'PICKUP')
    }
    
    initializeOrder()
  }, [])

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
    
    // 할인이 이미 적용된 상품 총액에서 포인트만 차감
    const currentAmount = orderDraft.payment.productTotal - orderDraft.payment.pointUsage
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
    
    setIsSubmitting(true)
    
    try {
      // 결제 페이지로 이동 
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
      return { isValid: false, message: '픽업 매장 정보가 없습니다.' }
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
    <div 
      className="min-h-screen bg-gray-50" 
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        height: '100vh'
      }}
    >
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={handleGoBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">주문서</h1>
            <span className="ml-2 text-sm text-gray-500">픽업 배송</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 주문 상품 목록 */}
        <OrderProductList products={orderDraft.products} />

        {/* 픽업 매장 정보 */}
        <PickupStoreInfo 
          storeGroups={orderDraft.pickupInfo?.storeGroups || []}
        />

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

        {/* 결제 금액 요약 */}
        <PaymentSummary 
          payment={orderDraft.payment} 
        />
      </div>

      {/* 하단 고정 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handlePayment}
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {orderDraft.payment.finalAmount.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
      
      {/* 하단 패딩 */}
      <div className="h-20"></div>
    </div>
  )
}

export default PickupOrderPage