import React, { useState, useEffect } from 'react'

const PointUsageForm = ({ availablePoint, currentUsage, maxUsage, onUpdate }) => {
  const [usePoints, setUsePoints] = useState(true) 
  const [pointAmount, setPointAmount] = useState(currentUsage)
  const [inputValue, setInputValue] = useState(currentUsage.toString())

  // 최대 사용 가능 포인트
  const maxUsablePoint = Math.min(availablePoint, maxUsage || availablePoint)

  useEffect(() => {
    setInputValue(pointAmount.toString())
  }, [pointAmount])

  const handleUsePointsToggle = (checked) => {
    setUsePoints(checked)
    if (checked) {
      // 체크박스 활성화 시, 현재 입력값 사용
      onUpdate(pointAmount)
    } else {
      // 체크박스 비활성화 시, 0으로 처리
      onUpdate(0)
    }
  }

  const handleInputChange = (value) => {
    setInputValue(value)
    
    // 숫자만 추출
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
    const validAmount = Math.max(0, Math.min(numericValue, maxUsablePoint))
    
    setPointAmount(validAmount)
    
    // 체크박스가 활성화된 경우에만 실제 업데이트
    if (usePoints) {
      onUpdate(validAmount)
    }
  }

  const handleInputBlur = () => {
    // 입력 완료 시 천단위 구분자 적용
    setInputValue(pointAmount.toLocaleString())
  }

  const handleInputFocus = () => {
    // 입력 시작 시 천단위 구분자 제거
    setInputValue(pointAmount.toString())
  }

  const useAllPoints = () => {
    setPointAmount(maxUsablePoint)
    setInputValue(maxUsablePoint.toString())
    if (usePoints) {
      onUpdate(maxUsablePoint)
    }
  }

  // 실제 사용되는 포인트 (체크박스 상태에 따라)
  const actualUsage = usePoints ? pointAmount : 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">포인트 사용</h2>
        <div className="text-sm text-gray-600">
          보유: <span className="font-semibold text-green-600">{availablePoint.toLocaleString()}P</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="usePoints"
            checked={usePoints}
            onChange={(e) => handleUsePointsToggle(e.target.checked)}
            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="usePoints" className="ml-2 text-gray-700">
            포인트 사용하기
          </label>
        </div>
        
        {maxUsage && maxUsage < availablePoint && (
          <div className="text-xs text-orange-600">
            최대 {maxUsage.toLocaleString()}P까지 사용 가능
          </div>
        )}
      </div>

      {/* 포인트 입력 영역 */}
      <div className="space-y-4">
        {/* 포인트 입력 */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={!usePoints}
              className={`w-full px-3 py-2 pr-8 border rounded-lg text-right ${
                usePoints 
                  ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white' 
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              placeholder="0"
            />
            <span className={`absolute right-3 top-2 text-sm ${usePoints ? 'text-gray-500' : 'text-gray-400'}`}>P</span>
          </div>
          
          <button
            onClick={useAllPoints}
            disabled={!usePoints || maxUsablePoint === 0}
            className={`px-4 py-2 border rounded-lg text-sm ${
              usePoints 
                ? 'text-green-600 border-green-600 hover:bg-green-50' 
                : 'text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
          >
            전액 사용
          </button>
        </div>

        {/* 사용 결과 표시 */}
        {actualUsage > 0 ? (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700">포인트 사용</span>
              <span className="font-semibold text-green-700">
                -{actualUsage.toLocaleString()}P ({actualUsage.toLocaleString()}원 할인)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-green-600 mt-1">
              <span>사용 후 보유 포인트</span>
              <span>{(availablePoint - actualUsage).toLocaleString()}P</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>포인트 미사용</span>
              <span>0P (0원 할인)</span>
            </div>
          </div>
        )}

        {/* 포인트 사용 안내 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 포인트는 1P = 1원으로 사용됩니다.</p>
          <p>• 결제 완료 후 사용된 포인트는 차감됩니다.</p>
        </div>
      </div>
    </div>
  )
}

export default PointUsageForm