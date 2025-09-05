import React, { useEffect, useState } from 'react'

const OrderUserInfo = ({ userInfo, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || ''
  })

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || ''
      })
    }
  }, [userInfo])

  const handlePhoneChange = (value) => {
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

    const updatedData = { ...formData, phone: formattedPhone }
    setFormData(updatedData)

    if (onUpdate) {
      onUpdate(updatedData)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">주문자 정보</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
            {userInfo.name || '-'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            연락처 (선택)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="연락처를 입력하세요 (선택사항)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
            {userInfo.email || '-'}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          주문자 정보는 회원 정보와 동일합니다. 수정이 필요한 경우 마이페이지에서 변경해주세요.
        </p>
      </div>
    </div>
  )
}

export default OrderUserInfo