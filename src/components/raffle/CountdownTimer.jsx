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

  if (Object.keys(timeLeft).length === 0) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className={`text-red-600 font-bold ${large ? 'text-4xl' : 'text-sm'}`}>마감</span>
      </div>
    );
  }

  if (large) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-gray-900">{timeLeft.days}</div>
              <div className="text-xs md:text-sm text-gray-600">일</div>
            </div>
            <div className="text-2xl md:text-4xl text-gray-400">:</div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs md:text-sm text-gray-600">시간</div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs md:text-sm text-gray-600">분</div>
            </div>
            <div className="text-2xl md:text-4xl text-gray-400">:</div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-green-600 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs md:text-sm text-gray-600">초</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
      <span className="text-orange-600 font-bold text-sm">
        {timeLeft.days}일 {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default CountdownTimer;