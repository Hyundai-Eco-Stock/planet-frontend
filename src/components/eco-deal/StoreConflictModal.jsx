import React from 'react'

const StoreConflictModal = ({ 
  isOpen, 
  onClose, 
  productName, 
  existingStore, 
  newStore, 
  existingQuantity,
  newQuantity,
  onKeepExisting, 
  onReplaceWithNew 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            매장 선택 충돌
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            이미 다른 매장에서 선택한 상품입니다.<br/>
            어떻게 처리하시겠습니까?
          </p>
        </div>

        {/* 상품 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{productName}</h4>
          
          {/* 기존 선택 */}
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <span className="text-sm text-gray-500">현재 장바구니</span>
              <div className="font-medium text-gray-900">
                현대백화점 {existingStore?.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">수량</div>
              <div className="font-medium text-gray-900">{existingQuantity}개</div>
            </div>
          </div>
          
          {/* 새로 선택한 것 */}
          <div className="flex items-center justify-between py-2 pt-3">
            <div>
              <span className="text-sm text-gray-500">새로 선택</span>
              <div className="font-medium text-blue-600">
                현대백화점 {newStore?.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">추가 수량</div>
              <div className="font-medium text-blue-600">+{newQuantity}개</div>
            </div>
          </div>
        </div>

        {/* 선택 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={onKeepExisting}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            기존 매장 유지 ({existingStore?.name})
            <div className="text-sm text-gray-500 mt-1">
              수량만 {existingQuantity + newQuantity}개로 증가
            </div>
          </button>
          
          <button
            onClick={onReplaceWithNew}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            새 매장으로 변경 ({newStore?.name})
            <div className="text-sm text-blue-200 mt-1">
              기존 상품을 새 매장 {newQuantity}개로 교체
            </div>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">
            <strong>참고:</strong> 픽업 상품은 매장별로 따로 픽업해야 하므로, 
            하나의 매장에서만 주문하는 것을 권장합니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoreConflictModal