import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            결제가 실패했습니다
          </h1>
          
          <p className="text-gray-600 mb-8">
            결제 처리 중 문제가 발생했습니다.<br />
            장바구니로 돌아가서 다시 시도해 주세요.
          </p>

          {message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-700 text-sm">
                <strong>오류 메시지:</strong> {message}
              </p>
              {code && (
                <p className="text-red-600 text-xs mt-1">
                  오류 코드: {code}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/cart/main', { replace: true })}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              장바구니로 돌아가기
            </button>
            
            <button
              onClick={() => navigate('/home/main', { replace: true })}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              메인으로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;