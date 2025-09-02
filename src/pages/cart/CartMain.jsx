import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '@/store/cartStore'
import CartSection from '@/components/cart/CartSection'
import EmptyCart from '@/components/cart/EmptyCart'
import { CustomCommonButton } from '@/components/_custom/CustomButtons'

const CartMain = () => {
  const navigate = useNavigate()
  
  // 하이드레이션 상태 추가
  const [isHydrated, setIsHydrated] = useState(false)
  
  // localStorage에서 직접 데이터 읽기
  const [localCartData, setLocalCartData] = useState({ deliveryCart: [], pickupCart: [] })
  
  // 스토어에서 필요한 데이터와 함수들 가져오기
  const { getTotalProducts } = useCartStore()
  
  // 현재 선택된 탭
  const [activeTab, setActiveTab] = useState('delivery')
  
  // 선택된 상품 ID들
  const [selectedProductIds, setSelectedProductIds] = useState([])
  
  // 컴포넌트 마운트 시 localStorage에서 직접 데이터 로드
  useEffect(() => {
    const loadCartData = () => {
      try {
        const cartData = localStorage.getItem('cart-storage')
        if (cartData) {
          const parsedData = JSON.parse(cartData)
          const state = parsedData.state || parsedData
          
          setLocalCartData({
            deliveryCart: state.deliveryCart || [],
            pickupCart: state.pickupCart || []
          })
        } else {
          setLocalCartData({ deliveryCart: [], pickupCart: [] })
        }
      } catch (error) {
        console.error('Error loading cart data:', error)
        setLocalCartData({ deliveryCart: [], pickupCart: [] })
      } finally {
        setIsHydrated(true)
      }
    }
    
    // 즉시 로드
    loadCartData()
    
    // localStorage 변경 감지
    const handleStorageChange = (e) => {
      if (e.key === 'cart-storage') {
        loadCartData()
      }
    }
    
    const handleCartUpdate = () => {
      loadCartData()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartStorageUpdate', handleCartUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartStorageUpdate', handleCartUpdate)
    }
  }, [])
  
  // 각 탭에 상품이 있는지 확인
  const hasDeliveryProducts = localCartData.deliveryCart.length > 0
  const hasPickupProducts = localCartData.pickupCart.length > 0
  const hasAnyProducts = hasDeliveryProducts || hasPickupProducts
  
  // 현재 활성 탭의 장바구니 가져오기
  const getCurrentCart = () => {
    return activeTab === 'delivery' ? localCartData.deliveryCart : localCartData.pickupCart
  }
  
  // 선택된 상품들만 필터링
  const getSelectedProducts = () => {
    const currentCart = getCurrentCart()
    return currentCart.filter(product => selectedProductIds.includes(product.id))
  }
  
  // 선택된 상품들의 원가 총합
  const getSelectedOriginalPrice = () => {
    const selectedProducts = getSelectedProducts()
    return selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)
  }
  
  // 선택된 상품들의 할인 적용된 총 가격
  const getSelectedTotalPrice = () => {
    const selectedProducts = getSelectedProducts()
    return selectedProducts.reduce((total, product) => {
      const discountedPrice = product.isEcoDeal 
        ? product.price * (1 - product.salePercent / 100)
        : product.price
      return total + (discountedPrice * product.quantity)
    }, 0)
  }
  
  // 선택된 상품들의 할인 금액
  const getSelectedDiscountAmount = () => {
    return getSelectedOriginalPrice() - getSelectedTotalPrice()
  }
  
  // 선택된 상품 개수
  const getSelectedProductsCount = () => {
    const selectedProducts = getSelectedProducts()
    return selectedProducts.reduce((total, product) => total + product.quantity, 0)
  }
  
  // 선택된 상품 변경 핸들러 (useCallback으로 메모이제이션)
  const handleSelectedChange = useCallback((selectedIds) => {
    setSelectedProductIds(selectedIds)
  }, [])
  
  // 주문하기 버튼 클릭
  const handleOrderClick = () => {
    const selectedProducts = getSelectedProducts()
  
    if (selectedProducts.length === 0) {
      alert('주문할 상품을 선택해주세요.')
      return
    }

    // 주문서에서 사용할 데이터 구조로 변환
    const orderProducts = selectedProducts.map(product => ({
      ...product,
      ecoDealStatus: product.isEcoDeal,
    }))
    
    // 주문 페이지로 이동
    navigate('/orders', { 
      state: { 
        products: orderProducts, 
        deliveryType: activeTab === 'pickup' ? 'PICKUP' : 'DELIVERY'
      } 
    })
  }
  
  // 하이드레이션 중이면 로딩 화면
  if (!isHydrated) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">장바구니를 불러오는 중...</p>
        </div>
      </div>
    )
  }
  
  // 빈 장바구니 화면
  if (!hasAnyProducts) {
    return <EmptyCart />
  }
  
  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      
      {/* 상단 탭 헤더 */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        <button 
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === 'delivery' 
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('delivery')}
        >
          일반 배송 ({localCartData.deliveryCart.length})
        </button>
        <button 
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === 'pickup' 
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pickup')}
        >
          픽업 배송 ({localCartData.pickupCart.length})
        </button>
      </div>
      
      {/* 장바구니 내용 영역 */}
      <div className="flex-1 pb-40">
        <CartSection 
          cartType={activeTab}
          products={getCurrentCart()}
          onSelectedChange={handleSelectedChange}
        />
      </div>
      
      {/* 하단 주문 버튼 영역 - 고정 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg p-4">
        
        {/* 가격 상세 정보 */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">총 상품금액</span>
            <span className="text-gray-900">
              {getSelectedOriginalPrice().toLocaleString()}원
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">총 할인금액</span>
            <span className="text-red-600">
              -{getSelectedDiscountAmount().toLocaleString()}원
            </span>
          </div>
          
          <hr className="border-gray-200" />
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">최종 결제금액</span>
            <span className="text-xl font-bold text-green-600">
              {getSelectedTotalPrice().toLocaleString()}원
            </span>
          </div>
        </div>
        
        <CustomCommonButton
          onClick={handleOrderClick}
          disabled={selectedProductIds.length === 0}
          className="w-full py-4 text-lg font-semibold"
        >
          주문하기 ({getSelectedProductsCount()}개)
        </CustomCommonButton>
        
        {/* 배송비 안내 */}
        <p className="text-center text-sm text-gray-500 mt-2">
          {activeTab === 'pickup' ? '매장 픽업 (무료)' : '일반 배송 (무료)'}
        </p>
      </div>
    </div>
  )
}

export default CartMain