import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomCommonButton } from '@/components/_custom/CustomButtons'
import emptyCartImage from '@/assets/empty-cart-character.png'

const EmptyCart = () => {
  const navigate = useNavigate()
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-4">
      
      {/* 빈 장바구니 아이콘 - 사진이나 더 예쁜 걸로 대체하면 좋을 듯 이것도 나쁘지 않고 */}
      <div className="mb-6">
        <img 
          src={emptyCartImage} 
          alt="빈 장바구니"
          className="w-60 h-60 object-contain"
        />
      </div>
      
      {/* 메인 메시지 */}
      <h2 className="text-xl font-medium text-gray-700 mb-2 text-center">
        장바구니가 비어있어요
      </h2>
      
      {/* 부가 메시지 */}
      <p className="text-gray-500 text-center mb-8 leading-6">
        마음에 드는 상품을 담아보세요!
      </p>
      
      {/* 행동 버튼들 */}
      <div className="space-y-3 w-full max-w-xs">
        <CustomCommonButton
          onClick={() => navigate('/shopping/main')}
          className="py-3 text-lg font-semibold"
        >
          쇼핑하러 가기
        </CustomCommonButton>
        
        <button
          onClick={() => navigate('/eco-deal/main')}
          className="w-full py-4 border border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 font-semibold transition"
        >
          푸드딜 상품 보기
        </button>
      </div>
    </div>
  )
}

export default EmptyCart