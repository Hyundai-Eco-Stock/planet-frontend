import React from 'react';
import useCountdown from '@/hooks/raffle/useCountdown';

const CountdownTimer = ({ endDate, large = false, isActive = true }) => {
  // endDate를 해당 날짜의 23:59:59.999로 설정
  const getEndOfDay = (dateString) => {
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999); // 23:59:59.999로 설정
    return date;
  };

  const adjustedEndDate = getEndOfDay(endDate);
  const timeLeft = useCountdown(adjustedEndDate);

  // 시간이 만료되었는지 확인
  const isExpired = !timeLeft || Object.keys(timeLeft).length === 0;

  if (large) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
        <div className="text-center mb-4">
          <p className="text-sm text-orange-700">
            {isExpired || !isActive ? '래플이 종료되었습니다' : '래플 마감까지'}
          </p>
          <h3 className="text-lg font-bold text-orange-900 mb-1">
            {isExpired || !isActive ? '마감' : '남은 시간'}
          </h3>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              isExpired || !isActive ? 'text-gray-400' : 'text-orange-600'
            }`}>
              {isExpired || !isActive ? '00' : (timeLeft.days || 0)}
            </div>
            <div className="text-xs text-gray-600">일</div>
          </div>
          <div className={`text-2xl ${isExpired || !isActive ? 'text-gray-400' : 'text-orange-400'}`}>:</div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              isExpired || !isActive ? 'text-gray-400' : 'text-orange-600'
            }`}>
              {isExpired || !isActive ? '00' : String(timeLeft.hours || 0).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600">시간</div>
          </div>
          <div className={`text-2xl ${isExpired || !isActive ? 'text-gray-400' : 'text-orange-400'}`}>:</div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              isExpired || !isActive ? 'text-gray-400' : 'text-orange-600'
            }`}>
              {isExpired || !isActive ? '00' : String(timeLeft.minutes || 0).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600">분</div>
          </div>
          <div className={`text-2xl ${isExpired || !isActive ? 'text-gray-400' : 'text-orange-400'}`}>:</div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              isExpired || !isActive ? 'text-gray-400' : 'text-orange-600 animate-pulse'
            }`}>
              {isExpired || !isActive ? '00' : String(timeLeft.seconds || 0).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600">초</div>
          </div>
        </div>
      </div>
    );
  }

  // 카드용 작은 타이머 - 오렌지 색상 적용
  if (isExpired || !isActive) {
    return (
      <div className="bg-black/40 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">마감</span>
          <div className="font-mono text-lg font-bold">00:00:00</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-md text-orange-500 px-4 py-3 rounded-xl border border-white/30 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">진행 중</span>
        <div className="font-mono text-lg font-bold">
          {(timeLeft.days || 0) > 0 && `${timeLeft.days}일 `}
          {String(timeLeft.hours || 0).padStart(2, '0')}:
          {String(timeLeft.minutes || 0).padStart(2, '0')}:
          {String(timeLeft.seconds || 0).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;