import React from 'react';

const EcoStockGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">에코스톡 이용 가이드</h2>
                <p className="text-green-100 text-sm">친환경 투자의 모든 것</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 차트 읽는 법 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">차트 읽는 법</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">녹색 캔들: 가격 상승</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">빨간 캔들: 가격 하락</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-3 bg-emerald-400 rounded mr-3 opacity-80"></div>
                <span className="text-sm text-gray-700">매수 거래량</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-3 bg-red-400 rounded mr-3 opacity-80"></div>
                <span className="text-sm text-gray-700">매도 거래량</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm text-gray-700">실시간 업데이트</span>
              </div>
            </div>
          </div>

          {/* 에코스톡 특징 */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">에코스톡 특징</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">ESG 활동으로 주식 획득</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">언제든 포인트 교환</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">친환경 기업 투자</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">지구 환경 보호 동참</span>
              </div>
            </div>
          </div>

          {/* 투자 팁 */}
          <div className="bg-gray-100 rounded-xl p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">스마트 투자 팁</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              장기적 관점에서 ESG 가치를 고려하여 현명한 투자 결정을 내리세요. 
              환경을 생각하는 기업에 투자하며 수익과 가치를 동시에 추구하는 것이 에코스톡의 핵심입니다.
            </p>
          </div>
        </div>
        
        {/* 버튼 */}
        <div className="flex justify-center p-6 pt-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EcoStockGuideModal;