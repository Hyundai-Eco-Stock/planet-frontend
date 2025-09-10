import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-8 text-center">
        {/* 실패 아이콘 */}
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-2">결제요청 처리실패</h1>
        <p className="text-gray-600 text-sm">결제 처리 중 문제가 발생했습니다</p>
      </div>

      {/* 구분선 */}
      <div className="border-t border-dashed border-gray-300 mx-6"></div>

      {/* 오류 정보 */}
      <div className="flex-1 px-6 py-6 pb-24">
        <div className="space-y-4">
          {/* 오류 메시지 */}
          {message && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">오류 메시지</span>
              <span className="text-red-600 text-sm font-medium">{message}</span>
            </div>
          )}

          {/* 오류 코드 */}
          {code && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">오류 코드</span>
              <span className="text-gray-500 text-sm">{code}</span>
            </div>
          )}

          {/* 구분선 */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* 처리 시간 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">처리일시</span>
            <span className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\./g, '-').slice(0, -1)} {new Date().toLocaleTimeString('ko-KR', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>

          {/* 안내 텍스트 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              • 결제 중 오류가 발생했습니다. 장바구니로 돌아가서 다시 시도해 주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 버튼들 - 하단 고정 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white p-4 border-t border-gray-200">
        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart/main', { replace: true })}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            장바구니로 돌아가기
          </button>
          
          <button
            onClick={() => navigate('/home/main', { replace: true })}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            메인으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;