import React from 'react'

const EcoDealWarningBox = ({ hasEcoDeals }) => {
  if (!hasEcoDeals) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-4">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.892-.833-2.664 0L4.15 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-amber-800 font-medium text-sm mb-1">
            에코딜 상품 구매 안내
          </h4>
          <p className="text-amber-700 text-sm leading-relaxed">
            환경보호를 위한 특가 상품으로 <strong>구매 후 취소가 불가능</strong>합니다. 
            신중히 확인 후 결제해주세요.
          </p>
          <div className="mt-2 text-xs text-amber-600">
            • 재고 처리 및 환경 영향 최소화를 위한 정책입니다
            <br />
            • 상품 불량 시에만 교환 가능합니다
          </div>
        </div>
      </div>
    </div>
  )
}

export default EcoDealWarningBox