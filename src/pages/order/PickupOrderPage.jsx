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
import EcoDealWarningBox from '@/components/eco-deal/EcoDealWarningBox'
import EcoDealAgreementCheckbox from '@/components/eco-deal/EcoDealAgreementCheckbox'

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
  const [agreeNoCancel, setAgreeNoCancel] = useState(false);

  // 결제위젯 refs
  const widgetRef = useRef(null)
  const methodsRef = useRef(null)

  // 환경변수에서 Toss clientKey 직접 사용
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY

  // 에코딜 상품 검사
  const hasEcoDeals = orderDraft?.products?.some(product =>
    product.ecoDealStatus || product.isEcoDeal
  ) || false

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

      // 매장 정보 검증 
      const productsWithStore = convertedProducts.filter(p => p.selectedStore)

      if (productsWithStore.length === 0) {
        alert('픽업 매장 정보가 없습니다. 장바구니에서 매장을 선택해주세요.')
        navigate('/cart/main')
        return
      }

      if (productsWithStore.length !== convertedProducts.length) {
        alert('일부 상품에 픽업 매장 정보가 없습니다. 장바구니에서 확인해주세요.')
        navigate('/cart/main')
        return
      }

      // 매장별로 상품 그룹핑
      const groupProductsByStore = (products) => {
        const storeGroups = {}
        const storeOrder = [] // 매장이 처음 나타난 순서를 기록

        products.forEach((product, index) => {
          if (product.selectedStore) {
            const storeId = product.selectedStore.id
            if (!storeGroups[storeId]) {
              storeGroups[storeId] = {
                store: product.selectedStore,
                products: [],
                firstAppearanceIndex: index // 해당 매장 상품이 처음 나타난 순서
              }
              storeOrder.push(storeId) // 매장 등장 순서 기록
            }
            storeGroups[storeId].products.push({
              ...product,
              originalIndex: index // 원래 순서 보존
            })
          }
        })

        // 매장이 처음 나타난 순서대로 정렬
        return storeOrder.map(storeId => ({
          store: storeGroups[storeId].store,
          products: storeGroups[storeId].products.sort((a, b) => a.originalIndex - b.originalIndex),
          firstAppearanceIndex: storeGroups[storeId].firstAppearanceIndex
        })).sort((a, b) => a.firstAppearanceIndex - b.firstAppearanceIndex)
      }

      const storeGroups = groupProductsByStore(convertedProducts)

      const originalTotal = convertedProducts.reduce((total, product) => {
        return total + (product.price * product.quantity)
      }, 0)

      const productTotal = convertedProducts.reduce((total, product) => {
        const discountedPrice = product.price * (1 - product.salePercent / 100)
        return total + (discountedPrice * product.quantity)
      }, 0)

      const discountAmount = originalTotal - productTotal

      const getTodayKST = () => {
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date())
      }

      // 다중 매장 픽업 정보 생성
      const pickupInfo = {
        // 백엔드 호환성을 위한 대표 매장 정보
        // 현재 DB 구조상 하나의 매장 ID만 저장 가능하므로 첫 번째 매장을 대표로 사용
        // 추후 DB 구조 변경 시 이 부분을 수정하면 됨
        departmentStoreId: storeGroups[0].store.id,
        departmentStoreName: storeGroups[0].store.name,
        pickupDate: getTodayKST(),
        pickupMemo: storeGroups.length > 1
          ? `다중 매장 픽업: ${storeGroups.map(g => g.store.name).join(', ')}`
          : '',

        // UI 표시용 모든 매장 그룹 정보
        storeGroups: storeGroups.map(group => ({
          store: {
            id: group.store.id,
            name: group.store.name,
            address: group.store.address,
            phone: group.store.phone || '매장 연락처',
            operatingHours: group.store.operatingHours || '10:30 ~ 20:00'
          },
          products: group.products.map(product => ({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            ecoDealStatus: product.ecoDealStatus
          }))
        })),

        // 결제 시 필요한 매장별 상세 정보
        storeDetails: storeGroups.map(group => ({
          storeId: group.store.id,
          storeName: group.store.name,
          storeAddress: group.store.address,
          productCount: group.products.length,
          totalQuantity: group.products.reduce((sum, p) => sum + p.quantity, 0)
        }))
      }

      // 주문서 생성 데이터
      const cartData = {
        selectedProducts: convertedProducts.map(product => ({
          ...product,
          originalPrice: product.price,
          discountedPrice: product.price * (1 - product.salePercent / 100),
          discountAmount: product.price * (product.salePercent / 100) * product.quantity,
          paidPrice: product.price * (1 - product.salePercent / 100)
        })),
        orderInfo: {
          totalPrice: productTotal,
          discountAmount: discountAmount
        },
        pickupInfo
      }

      await createOrderDraft(cartData, 'PICKUP')

      updatePointUsage(0)
      updateDonationAmount(0)
    }

    initializeOrder()
  }, [location.state, pickupCart, navigate, createOrderDraft, updatePointUsage, updateDonationAmount])

  // 결제위젯 렌더링
  useEffect(() => {
    if (!clientKey || !orderDraft?.payment?.finalAmount) return

    let mounted = true
      ; (async () => {
        try {
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

  // 기부금 계산
  const calculateRecommendedDonation = () => {
    if (!orderDraft) return 0

    // 기부금 제외한 실제 결제 금액
    const baseAmount = orderDraft.payment.productTotal - orderDraft.payment.pointUsage
    const remainder = baseAmount % 1000

    return remainder === 0 ? 0 : (1000 - remainder)
  }

  // 에코딜 상품이 없으면 자동으로 동의 상태로 설정 (기존 useEffect들 뒤에 추가)
  useEffect(() => {
    if (!hasEcoDeals) {
      setAgreeNoCancel(true)
    } else {
      setAgreeNoCancel(false)
    }
  }, [hasEcoDeals])



  // 결제하기 버튼 클릭
  const handlePayment = async () => {
    if (!orderDraft) return

    // 에코딜 동의 체크 추가
    if (hasEcoDeals && !agreeNoCancel) {
      alert('에코딜 상품의 취소 불가 정책에 동의해주세요.')
      return
    }

    // 유효성 검사 (다중 매장 지원)
    if (!orderDraft.pickupInfo?.storeGroups || orderDraft.pickupInfo.storeGroups.length === 0) {
      alert('픽업 매장 정보를 확인해주세요.')
      return
    }

    const amount = orderDraft.payment?.finalAmount ?? 0
    if (!amount || amount <= 0) {
      alert('유효하지 않은 결제 금액입니다.')
      return
    }

    const pickupDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())

    setIsSubmitting(true)

    try {
      // 주문서 최종 업데이트
      const finalOrderDraft = {
        ...orderDraft,
        pickupInfo: {
          ...orderDraft.pickupInfo,
          pickupDate,
        },
        payment: {
          ...orderDraft.payment,
          finalAmount: amount,
        },
      }

      updateOrderDraft(finalOrderDraft)

      // 성공 페이지 금액 검증용
      sessionStorage.setItem('expectedAmount', String(amount))

      // 주문 ID/이름 확정
      const finalOrderId = orderDraft.orderId || `PICKUP-${Date.now()}`;
      const orderName =
        (finalOrderDraft.products?.length ?? 0) > 1
          ? `${finalOrderDraft.products[0].name} 외 ${finalOrderDraft.products.length - 1}건`
          : finalOrderDraft.products?.[0]?.name || '주문 상품';

      // 다중 매장 픽업 정보 포함한 결제 데이터
      const orderDataForPayment = {
        orderType: 'PICKUP',
        orderId: finalOrderId,
        orderName,
        products: finalOrderDraft.products.map(product => ({
          productId: product.id,
          productName: product.name || product.productName || '상품명',
          quantity: product.quantity,
          price: product.originalPrice || product.paidPrice || product.price,
          salePercent: product.salePercent || 0,
          ecoDealStatus: product.ecoDealStatus || product.isEcoDeal || false,
          // 각 상품의 매장 정보 포함
          storeId: product.selectedStore?.id,
          storeName: product.selectedStore?.name
        })),
        deliveryInfo: null,
        pickupInfo: {
          // 기본 정보 (백엔드 호환성)
          departmentStoreId: finalOrderDraft.pickupInfo.departmentStoreId,
          departmentStoreName: finalOrderDraft.pickupInfo.departmentStoreName,
          pickupDate,
          pickupMemo: finalOrderDraft.pickupInfo.pickupMemo ?? '',
          // 다중 매장 상세 정보
          isMultiStore: finalOrderDraft.pickupInfo.storeGroups.length > 1,
          storeCount: finalOrderDraft.pickupInfo.storeGroups.length,
          storeDetails: finalOrderDraft.pickupInfo.storeDetails || [],
          storeGroups: finalOrderDraft.pickupInfo.storeGroups
        },
        pointsUsed: finalOrderDraft.payment.pointUsage || 0,
        donationAmount: finalOrderDraft.payment.donationAmount || 0,
        customerName: finalOrderDraft.orderUser.name || '',
        customerEmail: finalOrderDraft.orderUser.email || '',
        customerPhone: finalOrderDraft.orderUser.phone || ''
      }

      sessionStorage.setItem('paymentOrderDraft', JSON.stringify(orderDataForPayment));

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
        } catch { }
      }

      const digitsOnlyPhone = String(orderDraft?.orderUser?.phone || '')
        .replace(/^\+?82/, '0')
        .replace(/\D/g, '')

      // 결제위젯으로 바로 결제창 오픈 - 다중 매장 정보가 포함된 주문명
      const finalOrderName = finalOrderDraft.pickupInfo.storeGroups.length > 1
        ? `${orderName} (${finalOrderDraft.pickupInfo.storeGroups.length}개 매장 픽업)`
        : orderName;

      await widget.requestPayment({
        orderId: finalOrderId,
        orderName: finalOrderName,
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

  const isPaymentDisabled = hasEcoDeals ? !agreeNoCancel : false

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
            {orderDraft.pickupInfo?.storeGroups?.length > 1 && (
              <p>• <strong>여러 매장 픽업 시 각 매장을 모두 방문하셔야 합니다.</strong></p>
            )}
          </div>
        </div>

        {/* 주문자 정보 */}
        <OrderUserInfo userInfo={orderDraft.orderUser} />

        {/* 포인트 사용 */}
        <PointUsageForm
          availablePoint={orderDraft.userPoint || 0}
          currentUsage={orderDraft.payment.pointUsage}
          maxUsage={(orderDraft.payment.productTotal || 0) + (orderDraft.payment.donationAmount || 0)}
          onUpdate={updatePointUsage}
        />

        {/* 기부 옵션 */}
        <DonationForm
          recommendedAmount={calculateRecommendedDonation()}
          currentAmount={orderDraft.payment.donationAmount}
          onUpdate={updateDonationAmount}
        />

        {/* 에코딜 경고 박스 */}
        <EcoDealWarningBox hasEcoDeals={hasEcoDeals} />

        {/* 에코딜 동의 체크 박스 */}
        <EcoDealAgreementCheckbox
          hasEcoDeals={hasEcoDeals}
          isAgreed={agreeNoCancel}
          onAgreementChange={setAgreeNoCancel}
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
            disabled={isSubmitting || isPaymentDisabled}
            className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors ${isPaymentDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                처리 중...
              </div>
            ) : isPaymentDisabled ? (
              '취소 불가 정책 동의 필요'
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