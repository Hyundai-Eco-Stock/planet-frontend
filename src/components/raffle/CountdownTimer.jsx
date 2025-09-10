import React from 'react';
import useCountdown from '@/hooks/raffle/useCountdown';

const CountdownTimer = ({ endDate, large = false, isActive = true }) => {
  const timeLeft = useCountdown(endDate);
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
              <div className="text-2xl md:text-4xl font-bold text-gray-900 animate-pulse">{isExpired ? '00' : String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs md:text-sm text-gray-600">초</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 투명 배경에 오렌지 글자
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
          {timeLeft.days > 0 && `${timeLeft.days}일 `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;