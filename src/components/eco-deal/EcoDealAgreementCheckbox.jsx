import React from 'react'

const EcoDealAgreementCheckbox = ({ hasEcoDeals, isAgreed, onAgreementChange }) => {
  if (!hasEcoDeals) return null

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input 
          type="checkbox" 
          checked={isAgreed}
          onChange={(e) => onAgreementChange(e.target.checked)}
          className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
        />
        <div className="flex-1 text-sm">
          <span className="font-medium text-orange-800">
            에코딜 상품의 취소 불가 정책을 확인했으며 이에 동의합니다.
          </span>
          <div className="mt-2 text-xs text-orange-700 bg-white rounded p-2 border border-orange-100">
            위 내용을 충분히 이해했으며, 결제 완료 후 취소 및 환불이 불가능함을 동의합니다.
          </div>
        </div>
      </label>
    </div>
  )
}

export default EcoDealAgreementCheckbox