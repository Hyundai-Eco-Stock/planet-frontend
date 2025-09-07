import React, { useState, useEffect, useRef } from 'react'
import useCartStore from '@/store/cartStore'
import CartProduct from './CartProduct'
import { CustomCommonButton } from '@/components/_custom/CustomButtons'

const CartSection = ({ cartType, products, onSelectedChange }) => {
  const { clearCart, removeFromCart } = useCartStore()
  
  // 선택된 상품들의 ID 배열 (초기에는 빈 배열로 시작)
  const [selectedProducts, setSelectedProducts] = useState([])
  
  // 이전 products를 저장하는 ref
  const prevProductsRef = useRef()
  
  // products가 변경될 때마다 선택 상태 관리
  useEffect(() => {
    const currentProductIds = products.map(product => product.id)
    const prevProductIds = prevProductsRef.current?.map(product => product.id) || []
    
    // 이전 products와 비교해서 실제로 상품 목록이 변경되었는지 확인
    const hasProductListChanged = 
      currentProductIds.length !== prevProductIds.length ||
      currentProductIds.some(id => !prevProductIds.includes(id)) ||
      prevProductIds.some(id => !currentProductIds.includes(id))
    
    if (hasProductListChanged) {
      // 상품 목록이 변경된 경우, 유효한 선택만 유지
      setSelectedProducts(prev => prev.filter(id => currentProductIds.includes(id)))
    }
    
    // 현재 products를 이전 값으로 저장
    prevProductsRef.current = products
  }, [products])
  
  // 선택 상태가 변경될 때마다 부모에게 알림
  useEffect(() => {
    if (onSelectedChange) {
      onSelectedChange(selectedProducts)
    }
  }, [selectedProducts, onSelectedChange])
  
  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length && products.length > 0) {
      // 모두 선택된 상태면 전체 해제
      setSelectedProducts([])
    } else {
      // 일부만 선택된 상태면 전체 선택
      setSelectedProducts(products.map(product => product.id))
    }
  }
  
  // 개별 상품 선택/해제
  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      // 이미 선택된 상품이면 해제
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    } else {
      // 선택되지 않은 상품이면 추가
      setSelectedProducts([...selectedProducts, productId])
    }
  }
  
  // 선택된 상품들 삭제
  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) {
      alert('삭제할 상품을 선택해주세요.')
      return
    }
    
    const selectedCount = selectedProducts.length
    if (window.confirm(`선택한 ${selectedCount}개 상품을 삭제하시겠습니까?`)) {      
      // 각 선택된 상품을 개별 삭제
      selectedProducts.forEach((productId, index) => {
        const product = products.find(p => p.id === productId)
        if (product) {
          // 개별 삭제 실행
          removeFromCart(productId, product.isEcoDeal)
        } else {
          console.warn(`상품을 찾을 수 없음: ${productId}`)
        }
      })
      
      // 최종 상태 로그
      setTimeout(() => {
        console.log('최종 장바구니 상태:', useCartStore.getState())
      }, 100)
      
      setSelectedProducts([])
    }
  }
  
  // 전체 삭제
  const handleDeleteAll = () => {
    if (window.confirm('모든 상품을 삭제하시겠습니까?')) {
      clearCart(cartType)
      setSelectedProducts([])
    }
  }
  
  // 상품이 없는 경우
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg font-medium mb-2">
          {cartType === 'pickup' ? '픽업' : '일반'} 배송 상품이 없습니다
        </p>
        <p className="text-sm text-gray-400">
          {cartType === 'pickup' ? '에코딜 상품을 담아보세요!' : '상품을 담아보세요!'}
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-white">
      
      {/* 전체 선택 및 삭제 컨트롤 - 고정 */}
      <div className="fixed top-30 left-0 right-0 max-w-xl mx-auto flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white z-30">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selectedProducts.length === products.length && products.length > 0}
            onChange={handleSelectAll}
            className="mr-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm font-medium">
            전체선택 ({selectedProducts.length}/{products.length})
          </span>
        </label>
        
        <div className="flex gap-2">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedProducts.length === 0}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            선택삭제
          </button>
          <button
            onClick={handleDeleteAll}
            className="text-sm px-3 py-1.5 border border-red-300 rounded text-red-600 hover:bg-red-50"
          >
            전체삭제
          </button>
        </div>
      </div>
      
      {/* 전체선택 컨트롤 높이만큼 여백 */}
      <div className="h-16"></div>
      
      {/* 상품 목록 */}
      <div className="divide-y divide-gray-200">
        {products.map(product => (
          <CartProduct
            key={product.id}
            product={product}
            cartType={cartType}
            isSelected={selectedProducts.includes(product.id)}
            onSelect={() => handleSelectProduct(product.id)}
          />
        ))}
      </div>
      
      {/* 하단 안내 메시지 */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <p className="text-sm text-blue-700 text-center">
          {cartType === 'pickup' ? 
            '픽업 상품은 매장에서 직접 수령하시면 에코딜 할인이 적용됩니다.' : 
            '일반 배송 상품은 무료로 배송됩니다.'}
        </p>
      </div>
    </div>
  )
}

export default CartSection