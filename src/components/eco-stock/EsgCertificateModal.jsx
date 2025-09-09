import React from 'react';

const EsgCertificateModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-t-2xl text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">ESG 활동 인증</h2>
          <p className="text-green-100 text-sm mt-1">친환경 실천으로 에코스톡을 받아보세요</p>
        </div>
        
        {/* 본문 */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 leading-relaxed">
              다양한 ESG 활동을 통해<br />
              에코스톡을 획득할 수 있습니다
            </p>
          </div>
          
          {/* 혜택 정보 */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-emerald-700 font-semibold">환경 보호 실천</span>
            </div>
            <p className="text-emerald-600 text-sm text-center">
              텀블러 사용, 종이백 거절 등<br />
              친환경 활동으로 포인트 적립
            </p>
          </div>
        </div>
        
        {/* 버튼 */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            나중에
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            인증하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EsgCertificateModal;