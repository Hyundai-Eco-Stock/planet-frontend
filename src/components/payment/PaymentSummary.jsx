import React from 'react'

const PaymentSummary = ({ payment }) => {
  const {
    productTotal = 0,
    discountAmount = 0,
    pointUsage = 0,
    donationAmount = 0,
    finalAmount = 0
  } = payment

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">결제 금액</h2>
      
      <div className="space-y-3">
        {/* 상품 금액 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">상품 금액</span>
          <span className="text-gray-900">
            {productTotal.toLocaleString()}원
          </span>
        </div>
        
        {/* 상품 할인 */}
        {/* {discountAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">상품 할인</span>
            <span className="text-red-600">
              -{discountAmount.toLocaleString()}원
            </span>
          </div>
        )} */}
        
        {/* 배송비 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">배송비</span>
          <span className="text-green-600 text-sm">
            무료
          </span>
        </div>
        
        {/* 포인트 사용 */}
        {pointUsage > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">포인트 사용</span>
            <span className="text-blue-600">
              -{pointUsage.toLocaleString()}P
            </span>
          </div>
        )}
        
        {/* 기부 금액 */}
        {donationAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">기부 금액</span>
            <span className="text-orange-600">
              +{donationAmount.toLocaleString()}원
            </span>
          </div>
        )}
        
        {/* 구분선 */}
        <hr className="border-gray-200 my-4" />
        
        {/* 최종 결제 금액 */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-gray-900">최종 결제 금액</span>
          <span className="text-green-600">
            {finalAmount.toLocaleString()}원
          </span>
        </div>
      </div>
      
      {/* 결제 혜택 안내 */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <div className="text-sm text-green-700 space-y-1">
          <p className="font-medium">결제 혜택</p>
          <ul className="text-xs space-y-1 ml-4">
            <li>• 무료 배송</li>
            {discountAmount > 0 && (
              <li>• 에코딜 할인: {discountAmount.toLocaleString()}원</li>
            )}
            {pointUsage > 0 && (
              <li>• 포인트 사용: {pointUsage.toLocaleString()}원</li>
            )}
            {donationAmount > 0 && (
              <li>• 환경 기부: {donationAmount.toLocaleString()}원</li>
            )}
          </ul>
        </div>
      </div>
      
      {/* 주의사항 */}
      <div className="mt-3 text-xs text-gray-500">
        <p>• 결제 완료 후, 주문 취소 및 변경이 어려울 수 있습니다.</p>
        <p>• 포인트는 결제 완료 후, 차감됩니다.</p>
      </div>
    </div>
  )
}

export default PaymentSummary