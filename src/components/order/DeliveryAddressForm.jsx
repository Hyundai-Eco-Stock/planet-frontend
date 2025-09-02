import React, { useState, useRef, useEffect } from 'react'

const DeliveryAddressForm = ({ deliveryInfo, defaultDeliveryInfo, onUpdate }) => {
  const EMPTY = {
    recipientName: '', phone: '', address: '',
    detailAddress: '', zipCode: '', message: '',
    isDefaultAddress: false,
  }
  const initial = deliveryInfo ?? defaultDeliveryInfo ?? EMPTY
  const [formData, setFormData] = useState(initial)
  const [isEditing, setIsEditing] = useState(!initial.isDefaultAddress)
  const defaultSnapRef = useRef(null)

  useEffect(() => {
    if (!defaultSnapRef.current && defaultDeliveryInfo) {
      defaultSnapRef.current = { ...defaultDeliveryInfo }
    }
  }, [defaultDeliveryInfo]) 

  useEffect(() => {
    if (deliveryInfo) {
      setFormData(deliveryInfo)
      setIsEditing(!(deliveryInfo.isDefaultAddress ?? false))
    }
  }, [deliveryInfo])

  const handleInputChange = (field, value) => {
    // 연락처 자동 포맷팅
    if (field === 'phone') {
      const numbers = value.replace(/[^0-9]/g, '')
      let formattedPhone = numbers
      
      if (numbers.length <= 3) {
        formattedPhone = numbers
      } else if (numbers.length <= 7) {
        formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3)}`
      } else if (numbers.length <= 11) {
        formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
      } else {
        formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
      }
      value = formattedPhone
    }
    
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const handleUseNewAddress = () => {
    setIsEditing(true)
    const newData = { 
      ...formData, 
      isDefaultAddress: false,
      recipientName: '',
      phone: '',
      address: '',
      detailAddress: '',
      zipCode: '',
      message: ''
    }
    setFormData(newData)
    onUpdate(newData)
  }

  const handleUseDefaultAddress = () => {
    setIsEditing(false)
    // 기본 배송지 정보로 복원
    const snap = defaultSnapRef.current || {}
    const defaultData = {
      ...snap,
      isDefaultAddress: true
    }
    setFormData(defaultData)
    onUpdate(defaultData)
  }

  // 카카오 주소 검색 API 호출
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침 해주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        // 팝업에서 검색 결과 항목을 클릭했을때 실행할 코드
        let addr = '' // 주소 변수
        let extraAddr = '' // 참고항목 변수

        if (data.userSelectedType === 'R') { // 도로명 주소
          addr = data.roadAddress
        } else { // 지번 주소
          addr = data.jibunAddress
        }

        // 도로명 주소일 때 참고항목 조합
        if(data.userSelectedType === 'R'){
          // 법정동명이 있을 때 추가
          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
            extraAddr += data.bname
          }
          // 건물명이 있고, 공동주택일 때 추가
          if(data.buildingName !== '' && data.apartment === 'Y'){
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName)
          }
          // 표시할 참고항목이 있을 때만 괄호 추가
          if(extraAddr !== ''){
            extraAddr = ' (' + extraAddr + ')'
          }
        }

        // 최종 주소 조합
        const fullAddress = addr + extraAddr

        // 폼 데이터 업데이트
        const updatedData = {
          ...formData,
          address: fullAddress,
          zipCode: data.zonecode // 우편번호도 저장
        }
        setFormData(updatedData)
        onUpdate(updatedData)

        // 상세주소 입력 필드로 포커스 이동
        setTimeout(() => {
          const detailAddressInput = document.getElementById('detailAddress')
          if (detailAddressInput) {
            detailAddressInput.focus()
          }
        }, 100)
      },
      width: '100%',
      height: '100%',
      maxSuggestItems: 5
    }).open()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">배송지 정보</h2>
        <div className="flex space-x-2">
          {!isEditing && (
            <button 
              onClick={handleUseNewAddress}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              새 배송지 입력
            </button>
          )}
          {isEditing && formData.isDefaultAddress === false && (
            <button 
              onClick={handleUseDefaultAddress}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              기본 배송지 사용
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              받는 분 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="받는 분 이름을 입력하세요"
              disabled={!isEditing && formData.isDefaultAddress}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="연락처를 입력하세요"
              disabled={!isEditing && formData.isDefaultAddress}
            />
          </div>
        </div>

        {/* 우편번호 */}
        {formData.zipCode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우편번호
              </label>
              <input
                type="text"
                value={formData.zipCode}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.address}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              placeholder="주소 검색 버튼을 클릭하세요"
            />
            {(isEditing || !formData.isDefaultAddress) && (
              <button
                type="button"
                onClick={handleAddressSearch}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 whitespace-nowrap"
              >
                주소 검색
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상세주소
          </label>
          <input
            id="detailAddress"
            type="text"
            value={formData.detailAddress}
            onChange={(e) => handleInputChange('detailAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="상세주소를 입력하세요 (동, 호수 등)"
            disabled={!isEditing && formData.isDefaultAddress}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            배송 메시지 (선택)
          </label>
          <select
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">배송 메시지를 선택하세요</option>
            <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
            <option value="직접 받을게요">직접 받을게요</option>
            <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
            <option value="택배함에 넣어주세요">택배함에 넣어주세요</option>
            <option value="부재 시 안전한 곳에 놓아주세요">부재 시 안전한 곳에 놓아주세요</option>
          </select>
        </div>

        {formData.isDefaultAddress && !isEditing && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              기본 배송지로 배송됩니다.
            </p>
          </div>
        )}
        
        {isEditing && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-700">
              새로운 배송지 정보를 입력해주세요. 필수 항목(*)은 반드시 입력해야 합니다.
            </p>
          </div>
        )}

        {/* 주소 검색 안내 */}
        <div className="text-xs text-gray-500">
          <p>• 정확한 배송을 위해 주소 검색을 이용해주세요.</p>
          <p>• 상세주소에는 동, 호수 등 구체적인 위치를 입력해주세요.</p>
        </div>
      </div>
    </div>
  )
}

export default DeliveryAddressForm