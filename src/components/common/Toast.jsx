import React, { useEffect, useState } from 'react'

const Toast = ({ message, isVisible, onHide, duration = 3000 }) => {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // 작은 지연 후 애니메이션 시작
      setTimeout(() => setIsAnimating(true), 10)
      
      const timer = setTimeout(() => {
        // 사라지는 애니메이션 시작
        setIsAnimating(false)
        // 애니메이션 완료 후 컴포넌트 제거
        setTimeout(() => {
          setShouldRender(false)
          onHide()
        }, 300) // transition duration과 맞춤
      }, duration)
      
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      setTimeout(() => setShouldRender(false), 300)
    }
  }, [isVisible, duration, onHide])
  
  if (!shouldRender) return null
  
  return (
    <div className="fixed bottom-28 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className={`transform transition-all duration-300 ease-in-out ${
        isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
      }`}>
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 max-w-sm pointer-events-auto">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  )
}

export default Toast