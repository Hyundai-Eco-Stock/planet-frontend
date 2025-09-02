import React from 'react'
import { useNavigate } from 'react-router-dom'

const OrderProductList = ({ products }) => {
  const navigate = useNavigate()

  // 총 상품 개수 계산
  const getTotalQuantity = () => {
    return products.reduce((total, product) => total + product.quantity, 0)
  }

  const handleProductClick = (product) => {
    // 에코딜 상품인지 확인
    if (product.ecoDealStatus) {
      navigate(`/eco-deal/detail?productId=${product.id}`)
    } else {
      navigate(`/shopping/detail?productId=${product.id}`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">주문 상품</h2>
        <span className="text-sm text-gray-500">총 {getTotalQuantity()}개</span>
      </div>
      
      <div className="space-y-4">
        {products.map((product) => (
          <button 
            key={product.id} 
            onClick={() => handleProductClick(product)}
            className="w-full flex items-center space-x-4 py-4 border-b last:border-b-0 text-left hover:bg-gray-50 transition-colors rounded-lg"
          >
            <div className="flex-shrink-0">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
            </div>
            
            {/* 상품 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">수량: {product.quantity}개</span>
                
                {/* 에코딜 할인 표시 */}
                {product.ecoDealStatus && product.salePercent > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    에코딜 {product.salePercent}% 할인
                  </span>
                )}
              </div>
            </div>
            
            {/* 가격 정보 */}
            <div className="text-right flex-shrink-0">
              {product.ecoDealStatus && product.salePercent > 0 ? (
                <div>
                  {/* 개별 원가 */}
                  <div className="text-sm text-gray-400 line-through">
                    {product.price.toLocaleString()}원
                  </div>
                  {/* 개별 할인 가격 */}
                  <div className="font-semibold text-green-600">
                    {product.discountedPrice.toLocaleString()}원
                  </div>
                  {/* 할인율 표시 */}
                  <div className="text-xs text-red-500">
                    {product.salePercent}% 할인
                  </div>
                </div>
              ) : (
                <div className="font-semibold text-gray-900">
                  {product.price.toLocaleString()}원
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* 상품 목록 하단 요약 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">상품 금액 소계</span>
          <span className="font-semibold">
            {products.reduce((total, product) => total + product.totalPrice, 0).toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  )
}

export default OrderProductList