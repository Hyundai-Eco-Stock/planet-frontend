import Swal from 'sweetalert2';

const EcoStockGuide = () => {
    const showGuide = () => {
        Swal.fire({
            title: '',
            html: `
                <div class="text-left">
                    <div class="flex items-center justify-center mb-6">
                        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h2 class="text-xl font-bold text-gray-800">에코스톡 이용 가이드</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <!-- 차트 섹션 -->
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <h4 class="font-semibold text-gray-800 text-lg">차트 보는 법</h4>
                            </div>
                            <div class="space-y-3">
                                <div class="flex items-center">
                                    <div class="w-4 h-4 bg-green-500 rounded mr-3"></div>
                                    <span class="text-sm text-gray-700">녹색 캔들: 가격 상승</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-4 bg-red-500 rounded mr-3"></div>
                                    <span class="text-sm text-gray-700">빨간 캔들: 가격 하락</span>
                                </div>

                                <div class="flex items-center">
                                    <div class="w-4 h-3 bg-green-500 rounded mr-3 opacity-70"></div>
                                    <span class="text-sm text-gray-700">매수 거래량</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-3 bg-red-500 rounded mr-3 opacity-70"></div>
                                    <span class="text-sm text-gray-700">매도 거래량</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-3 h-3 bg-blue-500 rounded-full mr-3" style="animation: pulse 2s infinite;"></div>
                                    <span class="text-sm text-gray-700">실시간 업데이트</span>
                                </div>
                            </div>
                        </div>

                        <!-- 에코스톡 특징 섹션 -->
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <h4 class="font-semibold text-gray-800 text-lg">에코스톡 특징</h4>
                            </div>
                            <div class="space-y-3">
                                <div class="flex items-center">
                                    <div class="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                                    <span class="text-sm text-gray-700">ESG 활동으로 주식 획득</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                                    <span class="text-sm text-gray-700">언제든 포인트 교환</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-4 bg-green-600 rounded-full mr-3"></div>
                                    <span class="text-sm text-gray-700">친환경 기업 투자</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
                                    <span class="text-sm text-gray-700">지구 환경 보호 동참</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 투자 팁 섹션 -->
                    <div class="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-l-4 border-green-500">
                        <div class="flex items-start">
                            <div class="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800 mb-2 text-lg">스마트 투자 팁</h4>
                                <p class="text-sm text-gray-700 leading-relaxed">장기적 관점에서 ESG 가치를 고려하여 현명한 투자 결정을 내리세요. 환경을 생각하는 기업에 투자하며 수익과 가치를 동시에 추구하는 것이 에코스톡의 핵심입니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: '확인',
            confirmButtonColor: '#22c55e',
            width: '800px',
            customClass: {
                popup: 'rounded-xl',
                header: 'border-b-0',
                content: 'text-left'
            }
        });
    };

    return (
        <button
            onClick={showGuide}
            className="inline-flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors duration-200 shadow-md hover:shadow-lg"
            title="에코스톡 이용 가이드"
        >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
        </button>
    );
};

export default EcoStockGuide