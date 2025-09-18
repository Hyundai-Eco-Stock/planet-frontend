import React, { useState } from 'react';
import { usePersonalStockInfo, useStockCalculations, useStockSell, formatCurrency, formatPercent, formatNumericCurrency } from '@/hooks/eco-stock/usePortfolio';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import StockSellModal from './StockSellModal';
import EsgCertificateModal from './EsgCertificateModal';

const MyPortfolio = ({ currentData, stockInfo, onSell }) => {
    const navigate = useNavigate();
    const [isEsgModalOpen, setIsEsgModalOpen] = useState(false);

    // 커스텀 훅들
    const { memberStockInfo, isLoading: dataLoading, refetch } = usePersonalStockInfo(stockInfo?.id);
    const stock = useStockCalculations(currentData, memberStockInfo, dataLoading);
    const { isSelling, isModalOpen, handleSell, handleConfirmSell, closeModal } = useStockSell(stockInfo, stock, onSell, refetch);
    const { loginStatus } = useAuthStore.getState();
    const isProfit = stock.profitLoss >= 0;

    // ESG 활동 인증 팝업 및 라우팅
    const handleEsgCertificate = () => {
        setIsEsgModalOpen(true);
    };

    const handleEsgConfirm = () => {
        setIsEsgModalOpen(false);
        navigate('/eco-stock/certificate');
    };

    const handleEsgClose = () => {
        setIsEsgModalOpen(false);
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
                    <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        <p className="text-gray-500 ml-3">주식 데이터를 불러오는 중...</p>
                    </div>
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
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        {!loginStatus ? (
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">로그인이 필요합니다</h3>
                                <p className="text-gray-500 mb-6">로그인하여 내 포트폴리오를 확인해보세요</p>
                                <button
                                    onClick={handleLoginRedirect}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    로그인하러 가기
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">보유 중인 에코스톡이 없습니다</h3>
                                <p className="text-gray-500 mb-6">ESG 실천을 통해 에코 스톡을 받아보세요</p>
                                <button
                                    onClick={handleEsgCertificate}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    ESG 활동 인증하러 가기
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ESG 인증 모달 */}
                <EsgCertificateModal
                    isOpen={isEsgModalOpen}
                    onClose={handleEsgClose}
                    onConfirm={handleEsgConfirm}
                />
            </div>
        );
    }

    return (
        <div className="bg-white border-t border-gray-200 py-4">
            <div className="max-w-xl mx-auto">
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
                        <div className={`flex flex-col items-center justify-center md:justify-start ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                            <span className="mr-1">
                                {isProfit ? '▲' : '▼'} {formatCurrency(Math.abs(stock.profitLoss))} 포인트
                            </span>
                            <span className="font-bold">
                                ({formatPercent(stock.profitPercent)})
                            </span>
                        </div>
                    </div>
                </div>

                <div className="my-4">
                    <div className="border-t border-gray-200"></div>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className="flex justify-between py-1">
                        <span className="text-gray-600 text-sm">현재가</span>
                        <span className="font-semibold">{formatCurrency(stock.currentPrice)} 포인트</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span className="text-gray-600 text-sm">평균단가</span>
                        <span className="font-semibold">{formatCurrency(stock.purchasePrice)} 포인트</span>
                    </div>
                </div>
                <div className="mb-4">
                    <div className="flex justify-between py-1">
                        <span className="text-gray-600 text-sm">보유 포인트</span>
                        <span className="font-semibold">{formatNumericCurrency(stock.availablePoints)} 포인트</span>
                    </div>
                </div>

                {/* 매도 버튼 */}
                <div className="flex justify-center mb-4">
                    <button
                        onClick={handleSell}
                        disabled={isSelling || stock.quantity === 0}
                        className="w-full max-w-md bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                {/* {stock.quantity > 0 && (
                    <div className="text-center">
                        <p className={`text-sm ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isProfit
                                ? `현재 ${formatCurrency(stock.profitLoss)} 포인트의 수익이 발생했습니다.`
                                : `현재 ${formatCurrency(Math.abs(stock.profitLoss))} 포인트의 손실이 발생했습니다.`
                            }
                        </p>
                    </div>
                )} */}

                {/* 모달들 */}
                <StockSellModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    stockInfo={stockInfo}
                    stock={stock}
                    onConfirm={handleConfirmSell}
                    formatCurrency={formatCurrency}
                />

                <EsgCertificateModal
                    isOpen={isEsgModalOpen}
                    onClose={handleEsgClose}
                    onConfirm={handleEsgConfirm}
                />
            </div>
        </div>
    );
};

export default MyPortfolio;