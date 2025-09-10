import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '@/store/cartStore'

const CartProduct = ({ product, cartType, isSelected, onSelect }) => {
  const navigate = useNavigate()
  const { updateQuantity, removeFromCart } = useCartStore()

  // 수량 입력 모드 상태
  const [isEditing, setIsEditing] = useState(false)
  const [inputQuantity, setInputQuantity] = useState(product.quantity.toString())

  // 할인된 가격 계산
  const discountedPrice = product.isEcoDeal
    ? product.price * (1 - product.salePercent / 100)
    : product.price

  // 총 가격 (할인된 가격 × 수량)
  const totalPrice = discountedPrice * product.quantity

  const handleProductClick = () => {
    // 에코딜 상품인지 확인
    if (product.isEcoDeal) {
      navigate(`/eco-deal/detail?productId=${product.id}`)
    } else {
      navigate(`/shopping/detail?productId=${product.id}`)
    }
  }

  // 수량 변경 처리
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return // 최소 1개
    if (newQuantity > 99) return // 최대 99개
    updateQuantity(product.id, newQuantity, product.isEcoDeal)
  }

  // 수량 입력 시작
  const handleQuantityClick = () => {
    setIsEditing(true)
    setInputQuantity(product.quantity.toString())
  }

  // 수량 입력 완료
  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(inputQuantity, 10)
    if (isNaN(newQuantity) || newQuantity < 1) {
      setInputQuantity('1')
      handleQuantityChange(1)
    } else if (newQuantity > 99) {
      setInputQuantity('99')
      handleQuantityChange(99)
    } else {
      handleQuantityChange(newQuantity)
    }
    setIsEditing(false)
  }

  // 수량 입력 취소
  const handleQuantityCancel = () => {
    setInputQuantity(product.quantity.toString())
    setIsEditing(false)
  }

  // 입력 키 처리
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit()
    } else if (e.key === 'Escape') {
      handleQuantityCancel()
    }
  }

  // 상품 삭제 처리
  const handleRemove = () => {
    if (window.confirm(`${product.name}을(를) 삭제하시겠습니까?`)) {
      removeFromCart(product.id, product.isEcoDeal)
    }
  }

  return (
    <div className={`flex items-start gap-4 p-4 bg-white transition-all ${isSelected ? 'bg-green-50' : ''
      }`}>

      {/* 체크박스 */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="mt-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
      />

      {/* 상품 이미지 */}
      <button
        onClick={handleProductClick}
        className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label={`${product.name} 상품 상세 보기`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = ''
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          이미지
        </div>
      </button>

      {/* 상품 정보 */}
      <div className="flex-1 min-w-0">

        {/* 상품명과 삭제 버튼 */}
        <div className="flex justify-between items-start mb-2">
          <button
            onClick={handleProductClick}
            className="text-left flex-1 pr-2"
            aria-label={`${product.name} 상품 상세 보기`}
          >
            <h3 className="font-medium text-gray-900 text-sm leading-5 line-clamp-2 pr-2">
              {product.name}
            </h3>
          </button>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
            aria-label="상품 삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 픽업 매장 정보 표시 */}
        {cartType === 'pickup' && product.selectedStore && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xs font-medium text-blue-700">픽업: 현대백화점 {product.selectedStore.name}</span>
            </div>
          </div>
        )}

        {/* 픽업 상품인데 매장 정보가 없는 경우 경고 표시 */}
        {cartType === 'pickup' && !product.selectedStore && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-xs font-medium text-red-700">매장 선택 필요</span>
            </div>
            <div className="text-xs text-red-600 mt-0.5">
              상품 상세에서 픽업 매장을 선택해주세요.
            </div>
          </div>
        )}

        {/* 에코딜 배지 및 가격 정보 */}
        <div className="mb-3">
          {product.isEcoDeal ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  에코딜 {product.salePercent}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through text-sm">
                  {product.price.toLocaleString()}원
                </span>
                <span className="text-lg font-bold text-green-600">
                  {discountedPrice.toLocaleString()}원
                </span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-lg font-bold text-gray-900">
                {product.price.toLocaleString()}원
              </span>
            </div>
          )}
        </div>

        {/* 수량 조절 및 총 가격 */}
        <div className="flex justify-between items-center">

          {/* 수량 조절 버튼 */}
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => handleQuantityChange(product.quantity - 1)}
              disabled={product.quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            {/* 수량 표시/입력 영역 */}
            <div className="w-[50px] py-1 text-center border-x border-gray-300 bg-gray-50 flex items-center justify-center">
              {isEditing ? (
                <input
                  type="number"
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(e.target.value)}
                  onBlur={handleQuantitySubmit}
                  onKeyDown={handleInputKeyDown}
                  className="w-full text-center bg-transparent border-none outline-none font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max="99"
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleQuantityClick}
                  className="w-full h-full font-medium hover:text-green-600 transition-colors flex items-center justify-center"
                >
                  {product.quantity}
                </button>
              )}
            </div>

            <button
              onClick={() => handleQuantityChange(product.quantity + 1)}
              disabled={product.quantity >= 99}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* 총 가격 */}
          <div className="text-right">
            <span className="font-bold text-lg text-gray-900">
              {totalPrice.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="mt-2 text-xs text-gray-500">
          {cartType === 'pickup' ?
            '매장 픽업 (무료) - QR코드 제공' :
            '일반 배송 (무료)'}
        </div>
      </div>
    </div>
  )
}

export default CartProduct