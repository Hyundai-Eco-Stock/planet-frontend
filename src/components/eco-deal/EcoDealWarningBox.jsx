import React from 'react'

const EcoDealWarningBox = ({ hasEcoDeals }) => {
  if (!hasEcoDeals) return null

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.892-.833-2.664 0L4.15 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-orange-800 font-semibold text-sm mb-2">
            에코딜 상품 안내
          </h4>
          <div className="bg-orange-100 rounded-md p-3 mb-3">
            <p className="text-orange-800 font-medium text-sm text-center">
              환경보호 특가 상품으로 <span className="font-bold">결제 후 취소가 불가능</span>합니다
            </p>
          </div>
          <div className="text-xs text-orange-700 space-y-1">
            <p>• 상품 불량 시에만 교환 가능합니다</p>
            <p>• 픽업 후에는 반품이 불가능합니다</p>
            <p>• 주문 내용을 신중히 확인 후 결제해 주세요</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EcoDealWarningBox