import { create } from 'zustand'
import axios from 'axios'
import useAuthStore from './authStore'

const useOrderStore = create((set, get) => ({
  // 주문서 기본 정보
  orderDraft: null,
  isLoading: false,
  error: null,
      
  // 사용자 정보 
  userInfo: null,

  // 사용자 정보 로드
  loadUserInfo: async () => {
    set({ isLoading: true })

    const { accessToken, email, name } = useAuthStore.getState()

    // 테스트 mock 데이터
    if (!accessToken) {
      const mockUserInfo = {
        id: 1,
        name: name || '윤소정',
        phone: '010-1234-5678',
        email: email || 'sososo@example.com',
        address: '서울시 종로구 123',
        detailAddress: '456호',
        point: 5000
      }
      set({ userInfo: mockUserInfo, isLoading: false })
      return mockUserInfo
    }

    try {
      const response = await axios.get('/members/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      const userInfo = response.data
      set({ userInfo, error: null })
      return userInfo
      
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error)
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  // 주문서 생성
  createOrderDraft: async (cartData, orderType) => {
    const { selectedProducts, orderInfo, pickupInfo } = cartData
      
    // 사용자 정보 로드
    const userInfo = get().userInfo || await get().loadUserInfo()
      
    // 주문서 임시 데이터 생성
    const orderDraft = {
      orderId: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderType,
      
      // 상품 정보
      products: selectedProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        imageUrl: product.imageUrl,
        ecoDealStatus: product.ecoDealStatus,
        salePercent: product.salePercent || 0,

        // 할인 적용된 개별 가격
        discountedPrice: product.ecoDealStatus
          ? product.price * (1 - (product.salePercent || 0) / 100)
          : product.price,

        // 총 가격 (할인 적용)
        totalPrice: (product.ecoDealStatus
          ? product.price * (1 - (product.salePercent || 0) / 100)
          : product.price) * product.quantity,

        // 픽업 상품인 경우 매장 정보
        ...(orderType === 'PICKUP' && product.selectedStore && {
          storeId: product.selectedStore.id,
          storeName: product.selectedStore.name,
          storeAddress: product.selectedStore.address
        })
      })),

      // 주문자 정보
      orderUser: {
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email
      },

      // 사용자 포인트 정보
      userPoint: userInfo.point || 0,

      // 배송 정보 
      deliveryInfo: orderType === 'DELIVERY' ? {
        recipientName: userInfo.name,
        phone: userInfo.phone,
        address: userInfo.address || '',
        detailAddress: userInfo.detailAddress || '',
        message: '',
        isDefaultAddress: !!(userInfo.address)
      } : null,

      // 픽업 정보 - PickupOrderPage에서 전달받은 구조 사용
      pickupInfo: orderType === 'PICKUP' ? (pickupInfo || {
        storeGroups: groupProductsByStore(selectedProducts)
      }) : null,

      // 결제 정보
      payment: {
        productTotal: orderInfo.totalPrice,
        discountAmount: orderInfo.discountAmount || 0,
        pointUsage: 0,
        donationAmount: 0,
        finalAmount: orderInfo.totalPrice
      },

      createdAt: new Date().toISOString()
    }

    set({ orderDraft, isLoading: false, error: null })
    return orderDraft
  },

  // 주문서 업데이트
  updateOrderDraft: (updates) => {
    const currentDraft = get().orderDraft
    if (!currentDraft) return

    const updatedDraft = {
      ...currentDraft,
      ...updates,
      // 결제 금액 재계산
      payment: {
        ...currentDraft.payment,
        ...updates.payment,
        finalAmount: calculateFinalAmount({
          ...currentDraft.payment,
          ...updates.payment
        })
      }
    }

    set({ orderDraft: updatedDraft })
  },

  // 배송지 정보 업데이트
  updateDeliveryInfo: (deliveryInfo) => {
    get().updateOrderDraft({ deliveryInfo })
  },

  // 포인트 사용량 업데이트
  updatePointUsage: (pointUsage) => {
    const currentDraft = get().orderDraft
    if (!currentDraft) return

    const updatedPayment = {
      ...currentDraft.payment,
      pointUsage: pointUsage,
      finalAmount: calculateFinalAmount({
        ...currentDraft.payment,
        pointUsage: pointUsage
      })
    }

    set({
      orderDraft: {
        ...currentDraft,
        payment: updatedPayment
      }
    })
  },

  // 기부 금액 업데이트
  updateDonationAmount: (donationAmount) => {
    const currentDraft = get().orderDraft
    if (!currentDraft) return

    const updatedPayment = {
      ...currentDraft.payment,
      donationAmount: donationAmount,
      finalAmount: calculateFinalAmount({
        ...currentDraft.payment,
        donationAmount: donationAmount
      })
    }

    set({
      orderDraft: {
        ...currentDraft,
        payment: updatedPayment
      }
    })
  },

  // 주문서 초기화
  clearOrderDraft: () => {
    set({ orderDraft: null, isLoading: false, error: null })
  },

  // API 호출 상태 관리
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))

// 매장별로 상품 그룹핑
function groupProductsByStore(products) {
  const storeGroups = {}

  products.forEach(product => {
    if (product.selectedStore) {
      const storeId = product.selectedStore.id
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          store: product.selectedStore,
          products: []
        }
      }
      storeGroups[storeId].products.push(product)
    }
  })

  return Object.values(storeGroups)
}

// 최종 결제 금액 계산
function calculateFinalAmount(payment) {
  const { productTotal, pointUsage, donationAmount } = payment
  return Math.max(0, productTotal - pointUsage + donationAmount)
}

export default useOrderStore