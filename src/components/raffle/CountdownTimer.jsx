import React from 'react';
import useCountdown from '@/hooks/raffle/useCountdown';

const CountdownTimer = ({ endDate, large = false }) => {
  // endDate를 해당 날짜의 23:59:59로 설정
  const getEndOfDay = (dateString) => {
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999); // 23:59:59.999로 설정
    return date;
  };

  const adjustedEndDate = getEndOfDay(endDate);
  const timeLeft = useCountdown(adjustedEndDate);
  const isExpired = Object.keys(timeLeft).length === 0;

  if (large) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-gray-900">{isExpired ? 0 : timeLeft.days}</div>
              <div className="text-xs md:text-sm text-gray-600">일</div>
            </div>
            <div className="text-2xl md:text-4xl text-gray-400">:</div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-gray-900">{isExpired ? '00' : String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs md:text-sm text-gray-600">시간</div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-gray-900">{isExpired ? '00' : String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs md:text-sm text-gray-600">분</div>
            </div>
            <div className="text-2xl md:text-4xl text-gray-400">:</div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-emerald-600 animate-pulse">{isExpired ? '00' : String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs md:text-sm text-gray-600">초</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 마감된 경우와 진행 중인 경우 모두 처리
  if (isExpired) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
        <span className="text-gray-500 font-bold text-3xl">
          00:00:00
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-5 h-5 bg-emerald-600 rounded-full animate-pulse"></div>
      <span className="text-emerald-600 font-bold text-3xl">
        {timeLeft.days}일 {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default CountdownTimer;