import React, { useState, useEffect } from 'react'

const DonationForm = ({ recommendedAmount, onUpdate }) => {
  const [donationEnabled, setDonationEnabled] = useState(false)
  const [donationAmount, setDonationAmount] = useState(recommendedAmount || 0)
  const [inputValue, setInputValue] = useState((recommendedAmount || 0).toString())

  // recommendedAmount가 변경될 때마다 업데이트
  useEffect(() => {
    if (!donationEnabled) {
      setDonationAmount(recommendedAmount || 0)
      setInputValue((recommendedAmount || 0).toString())
    }
  }, [recommendedAmount, donationEnabled])

  useEffect(() => {
    setInputValue(donationAmount.toString())
  }, [donationAmount])

  const handleDonationToggle = (checked) => {
    setDonationEnabled(checked)
    if (checked) {
      // 체크박스 활성화 시, 현재 추천값이나 입력값 사용
      const amount = donationAmount > 0 ? donationAmount : (recommendedAmount > 0 ? recommendedAmount : 100)
      setDonationAmount(amount)
      setInputValue(amount.toString())
      onUpdate(amount)
    } else {
      // 체크박스 비활성화 시, 0으로 처리
      onUpdate(0)
    }
  }

  const handleInputChange = (value) => {
    setInputValue(value)
    
    // 숫자만 추출
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
    const validAmount = Math.max(0, Math.min(numericValue, 10000))
    
    setDonationAmount(validAmount)
    
    // 체크박스가 활성화된 경우에만 실제 업데이트
    if (donationEnabled) {
      onUpdate(validAmount)
    }
  }

  const handleInputBlur = () => {
    // 입력 완료 시 천단위 구분자 적용
    setInputValue(donationAmount.toLocaleString())
  }

  const handleInputFocus = () => {
    // 입력 시작 시 천단위 구분자 제거
    setInputValue(donationAmount.toString())
  }

  const usePresetAmount = (amount) => {
    setDonationAmount(amount)
    setInputValue(amount.toString())
    if (donationEnabled) {
      onUpdate(amount)
    }
  }

  const useRecommendedAmount = () => {
    setDonationAmount(recommendedAmount)
    setInputValue(recommendedAmount.toString())
    if (donationEnabled) {
      onUpdate(recommendedAmount)
    }
  }

  // 추천 기부 금액들
  const presetAmounts = [100, 500, 1000, 2000, 5000]

  // 실제 기부되는 금액
  const actualDonation = donationEnabled ? donationAmount : 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">(선택) 2025 내 나무 갖기 기부 프로젝트</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableDonation"
            checked={donationEnabled}
            onChange={(e) => handleDonationToggle(e.target.checked)}
            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="enableDonation" className="ml-2 text-gray-700">
            환경 보호를 위해 기부하기
          </label>
        </div>
        
        {recommendedAmount > 0 && (
          <button
            onClick={useRecommendedAmount}
            disabled={!donationEnabled}
            className={`text-sm px-2 py-1 rounded ${
              donationEnabled 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            추천: {recommendedAmount}원
          </button>
        )}
      </div>

      {/* 기부 금액 입력 영역 */}
      <div className="space-y-4">
        {/* 기부 금액 입력 */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={!donationEnabled}
              className={`w-full px-3 py-2 pr-8 border rounded-lg text-right ${
                donationEnabled 
                  ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white' 
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              placeholder="0"
            />
            <span className={`absolute right-3 top-2 text-sm ${donationEnabled ? 'text-gray-500' : 'text-gray-400'}`}>원</span>
          </div>
        </div>

        {/* 빠른 선택 버튼들 */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-sm self-center ${donationEnabled ? 'text-gray-600' : 'text-gray-400'}`}>빠른 선택:</span>
          {presetAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => usePresetAmount(amount)}
              disabled={!donationEnabled}
              className={`px-3 py-1 text-sm border rounded-full ${
                donationEnabled 
                  ? 'border-gray-300 hover:bg-gray-50 text-gray-700' 
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {amount.toLocaleString()}원
            </button>
          ))}
        </div>

        {/* 기부 결과 표시 */}
        {actualDonation > 0 ? (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-orange-700">환경 기부</span>
              <span className="font-semibold text-orange-700">
                +{actualDonation.toLocaleString()}원
              </span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              기부금은 환경 보호 활동에 사용됩니다
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>기부 미참여</span>
              <span>+0원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              작은 기부로도 환경 보호에 큰 도움이 됩니다
            </p>
          </div>
        )}

        {/* 기부 안내 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 기부금은 2025 내 나무 갖기 기부 프로젝트 지원에 사용됩니다.</p>
          <p>• 기부 내역은 주문 완료 후 확인할 수 있습니다.</p>
          <p>• 최대 10,000원까지 기부 가능합니다.</p>
        </div>
      </div>
    </div>
  )
}

export default DonationForm