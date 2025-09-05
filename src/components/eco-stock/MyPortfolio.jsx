import React from 'react';
import { usePersonalStockInfo, useStockCalculations, useStockSell, formatCurrency, formatPercent } from '@/hooks/eco-stock/usePortfolio';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import StockSellModal from './StockSellModal';

const MyPortfolio = ({ currentData, stockInfo, onSell }) => {
    const navigate = useNavigate();
    // 커스텀 훅들
    const { memberStockInfo, isLoading: dataLoading, refetch } = usePersonalStockInfo(stockInfo?.id);
    const stock = useStockCalculations(currentData, memberStockInfo, dataLoading);
const { isSelling, isModalOpen, handleSell, handleConfirmSell, closeModal } = useStockSell(stockInfo, stock, onSell, refetch);
    const { loginStatus } = useAuthStore.getState();
    const isProfit = stock.profitLoss >= 0;

    // ESG 활동 인증 팝업 및 라우팅
    const handleEsgCertificate = () => {
        Swal.fire({
            title: 'ESG 활동 인증',
            text: 'ESG 활동 인증하러 가시겠습니까?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '네, 인증하러 가요!',
            cancelButtonText: '취소',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/eco-stock/certificate');
            }
        });
    };
    // 로그인 페이지로 이동
    const handleLoginRedirect = () => {
        navigate('/login');
    };
    // 로딩 상태
    if (!currentData || dataLoading) {
        return (
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-500">주식 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 보유 주식 없음 또는 미로그인
    if (!loginStatus || stock.isEmpty) {
        return (
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="py-8">
                        <div className="text-6xl mb-4">📊</div>
                        {!loginStatus ? (
                            <>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">로그인이 필요합니다</h3>
                                <p className="text-gray-500 mb-6">로그인하여 내 포트폴리오를 확인해보세요!</p>
                                <button
                                    onClick={handleLoginRedirect}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    로그인하러 가기
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">보유 중인 에코스톡이 없습니다</h3>
                                <p className="text-gray-500 mb-6">ESG 실천을 통해 에코 스톡을 받아보세요!</p>
                                <button
                                    onClick={handleEsgCertificate}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    ESG 활동 인증하러 가기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-white border-t border-gray-200 p-4 mb-10">
            <div className="max-w-4xl mx-auto">
                {/* 보유 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-600 mb-1">내 보유</p>
                        <p className="text-lg font-bold text-blue-600">{stock.quantity}주</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-600 mb-1">현재 가치</p>
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(stock.currentValue)} 포인트</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-600 mb-1">구매 가치</p>
                        <p className="text-lg font-medium text-gray-600">{formatCurrency(stock.purchaseValue)} 포인트</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-600 mb-1">손익</p>
                        <div className={`flex items-center justify-center md:justify-start ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="mr-1">{isProfit ? '▲' : '▼'}</span>
                            <span className="font-bold">
                                {formatCurrency(Math.abs(stock.profitLoss))} ({formatPercent(stock.profitPercent)})
                            </span>
                        </div>
                    </div>
                </div>

                <div className="my-6">
                    <div className="border-t border-gray-200"></div>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">현재가:</span>
                        <span className="font-medium">{formatCurrency(stock.currentPrice)} 포인트</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">평균단가:</span>
                        <span className="font-medium">{formatCurrency(stock.purchasePrice)} 포인트</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">보유 포인트:</span>
                        <span className="font-medium">{formatCurrency(stock.availablePoints)} 포인트</span>
                    </div>
                </div>

                {/* 매도 버튼 */}
                <div className="flex justify-center">
                    <button
                        onClick={handleSell}
                        disabled={isSelling || stock.quantity === 0}
                        className="w-full max-w-md bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isSelling ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                처리중...
                            </div>
                        ) : stock.quantity === 0 ? (
                            '보유 주식 없음'
                        ) : (
                            '포인트로 교환'
                        )}
                    </button>
                </div>


                {/* 수익률 메시지 */}
                {stock.quantity > 0 && (
                    <div className="mt-3 text-center">
                        <p className={`text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            {isProfit
                                ? `현재 ${formatCurrency(stock.profitLoss)} 포인트의 수익이 발생했습니다.`
                                : `현재 ${formatCurrency(Math.abs(stock.profitLoss))} 포인트의 손실이 발생했습니다.`
                            }
                        </p>
                    </div>
                )}
                {/* 새 모달 추가 */}
                <StockSellModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    stockInfo={stockInfo}
                    stock={stock}
                    onConfirm={handleConfirmSell}
                    formatCurrency={formatCurrency}
                />
            </div>
        </div>
    );
};

export default MyPortfolio;