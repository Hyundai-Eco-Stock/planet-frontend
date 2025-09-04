import React, { useState, useEffect } from 'react'

const PointUsageForm = ({ availablePoint, currentUsage, maxUsage, onUpdate }) => {
  const initial = Number.isFinite(currentUsage) ? currentUsage : 0
  const [usePoints, setUsePoints] = useState(initial > 0)
  const [pointAmount, setPointAmount] = useState(initial)
  const [inputValue, setInputValue] = useState(String(initial))

  // 최대 사용 가능 포인트
  const maxUsablePoint = Math.max(
    0,
    Math.min(
      Number.isFinite(availablePoint) ? availablePoint : 0,
      Number.isFinite(maxUsage) ? maxUsage : availablePoint ?? 0 // maxUsage 미지정 시 보유포인트까지만
    )
  )

  // 공통 클램프 함수
  const clamp = (n) => {
    const v = Number.isFinite(n) ? n : 0
    return Math.max(0, Math.min(v, maxUsablePoint))
  }

  // 포맷 제어용: blur 시 콤마, focus 시 생 숫자
  const formatThousand = (n) => n.toLocaleString()
  const toNumber = (str) => {
    const num = parseInt(String(str).replace(/[^0-9]/g, ''), 10)
    return Number.isNaN(num) ? 0 : num
  }

  useEffect(() => {
    const next = Number.isFinite(currentUsage) ? currentUsage : 0
    setPointAmount(next)
    setInputValue(String(next))
    setUsePoints(next > 0)
  }, [currentUsage])

  // 부모가 availablePoint/maxUsage를 바꿔 상한이 줄면 즉시 내리고 부모에게 반영
  useEffect(() => {
    const fixed = clamp(pointAmount)
    if (fixed !== pointAmount) {
      setPointAmount(fixed)
      setInputValue(fixed.toString())
      if (usePoints) onUpdate(fixed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availablePoint, maxUsage])

  useEffect(() => {
    setInputValue(pointAmount.toString())
  }, [pointAmount])

  const handleUsePointsToggle = (checked) => {
    setUsePoints(checked)
    if (checked) {
      const fixed = clamp(pointAmount)
      setPointAmount(fixed)
      onUpdate(fixed)
    } else {
      // 체크박스 비활성화 시, 0으로 처리
      onUpdate(0)
    }
  }

  const handleInputChange = (value) => {
    setInputValue(value)

    const numeric = toNumber(value)
    const fixed = clamp(numeric)

    setPointAmount(fixed)

    // 체크박스가 활성화된 경우에만 실제 업데이트
    if (usePoints) {
      onUpdate(fixed)
    }
  }

  const handleInputBlur = () => {
    // 입력 완료 시 천단위 구분자 적용
    setInputValue(pointAmount.toLocaleString())
  }

  const handleInputFocus = () => {
    // 입력 시작 시 천단위 구분자 제거
    setInputValue(formatThousand(pointAmount))
  }

  const useAllPoints = () => {
    const fixed = clamp(maxUsablePoint)

    if (pointAmount == fixed) return

    setPointAmount(fixed)
    setInputValue(fixed.toString())
    if (usePoints) {
      onUpdate(fixed)
    }
  }

  // 실제 사용되는 포인트 (체크박스 상태에 따라)
  const actualUsage = usePoints ? pointAmount : 0

  // 전액 사용 버튼 비활성화 조건
  const isAllPointsUsed = pointAmount >= maxUsablePoint

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
           <label htmlFor="usePoints" className="ml-2 text-gray-700">포인트 사용하기</label>
        </div>

        {Number.isFinite(maxUsage) && maxUsage < availablePoint && (
          <div className="text-xs text-orange-600">최대 {maxUsablePoint.toLocaleString()}P까지 사용 가능</div>
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
              className={`w-full px-3 py-2 pr-8 border rounded-lg text-right ${usePoints
                  ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              placeholder="0"
            />
            <span className={`absolute right-3 top-2 text-sm ${usePoints ? 'text-gray-500' : 'text-gray-400'}`}>P</span>
          </div>

          <button
            onClick={useAllPoints}
            disabled={!usePoints || maxUsablePoint === 0 || isAllPointsUsed}
            className={`px-4 py-2 border rounded-lg text-sm ${
              usePoints && !isAllPointsUsed
                ? 'text-green-600 border-green-600 hover:bg-green-50'
                : 'text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
          >
            {isAllPointsUsed ? '최대 사용중' : '전액 사용'}
          </button>
        </div>

        {/* 사용 결과 표시 */}
        {actualUsage > 0 ? (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700">포인트 사용</span>
              <span className="font-semibold text-green-700">
                {actualUsage.toLocaleString()}P ({actualUsage.toLocaleString()}원 할인)
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
          <p>• 최대 주문 금액까지만 사용 가능합니다.</p>
        </div>
      </div>
    </div>
  )
}

export default PointUsageForm