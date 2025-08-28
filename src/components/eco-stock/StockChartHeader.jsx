import React from 'react';
import ModernStockSelector from './ModernStockSelector';
import EcoStockGuide from './EcoStockGuide';

const StockChartHeader = ({ stockList, stockId, onStockChange, getStockName, currentData, chartData }) => {

    const getCurrentPrice = () => {
        return currentData?.ohlcData?.close || 0;
    };

    // 가격 변동률 계산
    const getPriceChange = () => {
        if (!chartData?.ohlcData || chartData.ohlcData.length < 2) return { amount: 0, percent: 0 };

        const current = getCurrentPrice();
        const previous = chartData.ohlcData[chartData.ohlcData.length - 2]?.close || current;
        const amount = current - previous;
        const percent = previous > 0 ? (amount / previous) * 100 : 0;

        return { amount, percent };
    };

    // ✅ 이제 호출
    const priceChange = getPriceChange();
    return (
        <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    {/* 왼쪽: 아이콘 + 제목 */}
                    <div className="flex items-center space-x-3">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">에코 스톡</h2>
                            <p className="text-sm text-gray-500">친환경 기업 투자로 지구와 함께 성장하세요</p>
                        </div>
                    </div>

                    {/* 오른쪽: 가이드 버튼 */}
                    <EcoStockGuide />
                </div>
                

                {/* 주식 선택 섹션 */}
                <div className="flex items-center justify-between w-full mb-4 pt-2">
                    {/* 왼쪽: 주식 정보 - 클릭 가능한 드롭다운 */}
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl 
                     flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {getStockName(stockId).charAt(0)}
                        </div>
                        <div>
                            {stockList && stockList.length > 0 ? (
                                <div className="w-64">
                                    <ModernStockSelector
                                        stockList={stockList}
                                        selectedStockId={stockId}
                                        onStockChange={onStockChange}
                                    />
                                </div>
                            ) : (
                                <h3 className="text-xl font-bold text-gray-900">
                                    {getStockName(stockId)}
                                </h3>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm text-gray-500">실시간 차트</p>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 현재가 정보 */}
                    <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 mb-1">
                            ₩{getCurrentPrice().toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <div className="text-sm text-gray-600">현재가</div>
                            {priceChange.amount !== 0 && (
                                <div className={`text-sm font-medium ${priceChange.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    <span className="mr-1">
                                        {priceChange.amount >= 0 ? '▲' : '▼'}
                                    </span>
                                    <span>
                                        {Math.abs(priceChange.amount).toLocaleString()}
                                        ({Math.abs(priceChange.percent).toFixed(2)}%)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                </div>
                {/* 구분선 */}
                <div className="border-t border-gray-200"></div>
            </div>
        </div>
    );
};

export default StockChartHeader;