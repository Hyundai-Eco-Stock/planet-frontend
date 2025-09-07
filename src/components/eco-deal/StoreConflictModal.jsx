import React from 'react'

const safeNum = (v, d = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

const StoreConflictModal = ({
  isOpen,
  onClose,
  productName,
  existingStore,
  newStore,
  existingQuantity,
  newQuantity,
  onKeepExisting,
  onReplaceWithNew,
  canKeepExisting = true,
}) => {
  if (!isOpen) return null

  const existQty = safeNum(existingQuantity, 0)
  const addQty = safeNum(newQuantity, 0)
  const onlyReplace = !canKeepExisting

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {onlyReplace ? '이 상품은 현재 장바구니 매장에서 픽업 불가' : '매장 선택 충돌'}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {onlyReplace
              ? '현재 장바구니에 설정된 매장에서는 이 상품을 픽업할 수 없습니다. 새 매장으로 변경해 진행해 주세요.'
              : '이미 다른 매장에서 담긴 상품입니다. 어떻게 처리할까요?'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{productName}</h4>

          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <span className="text-sm text-gray-500">현재 장바구니</span>
              <div className="font-medium text-gray-900">{existingStore?.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">수량</div>
              <div className="font-medium text-gray-900">{existQty}개</div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 pt-3">
            <div>
              <span className="text-sm text-gray-500">선택한 매장</span>
              <div className="font-medium text-blue-600">{newStore?.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">추가 수량</div>
              <div className="font-medium text-blue-600">+{addQty}개</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {canKeepExisting && (
            <button
              onClick={onKeepExisting}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              기존 매장 유지 ({existingStore?.name})
              <div className="text-sm text-gray-500 mt-1">수량만 증가</div>
            </button>
          )}

          <button
            onClick={onReplaceWithNew}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            새 매장으로 변경 ({newStore?.name})
            {onlyReplace && <div className="text-sm text-blue-200 mt-1">이 옵션만 선택할 수 있어요</div>}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoreConflictModal
