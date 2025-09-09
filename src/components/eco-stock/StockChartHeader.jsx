import React from 'react';
import ModernStockSelector from './ModernStockSelector';
import EcoStockGuide from './EcoStockGuide';

const StockChartHeader = ({ stockList, stockId, onStockChange, getStockName, currentData, previousStockData }) => {

    const getCurrentPrice = () => {
        return currentData?.ohlcData?.close ?? 0;
    };

    // CHANGED: NaN 방지 + 0%도 표시
    const getPriceChange = () => {
        const currentClose = currentData?.ohlcData?.close;
        const prevClose = previousStockData?.ohlcData?.close;

        if (Number.isFinite(currentClose) && Number.isFinite(prevClose)) {
            const amount = currentClose - prevClose;
            const percent = prevClose !== 0 ? (amount / prevClose) * 100 : 0;
            return { amount, percent };
        }
        return { amount: 0, percent: 0 };
    };

    const priceChange = getPriceChange();

    const getPriceChangeStyle = () => {
        if (priceChange.amount > 0) return 'text-emerald-600';
        if (priceChange.amount < 0) return 'text-red-600';
        return 'text-gray-600'; // 0%는 회색
    };

    const getPriceChangeIcon = () => {
        if (priceChange.amount > 0) return '▲';
        if (priceChange.amount < 0) return '▼';
        return '—'; // 0% 아이콘
    };

    const getStockImageUrl = (stockId) => {
        const stock = stockList?.find(stock => stock.id === stockId);
        return stock?.imageUrl;
    };


    return (
        <div className="bg-white border-gray-200 p-4 relative z-10">
            <div className="max-w-4xl mx-auto min-w-0">
                <div className="flex items-center justify-between mb-6 sm:mb-10 gap-4">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">에코 스톡</h2>
                            <p className="text-xs sm:text-sm text-gray-500">친환경 기업 투자로 지구와 함께 성장하세요</p>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <EcoStockGuide />
                    </div>
                </div>

                <div className="flex items-center justify-between w-full mb-4 pt-2 gap-2 sm:gap-4 min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg flex-shrink-0 overflow-hidden">
                            {getStockImageUrl(stockId) ? (
                                <img
                                    src={getStockImageUrl(stockId)}
                                    alt={getStockName(stockId)}
                                    className="w-full h-full object-cover rounded-xl"
                                    onError={(e) => {
                                        // 이미지 로드 실패 시 기존 방식으로 폴백
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg"
                                style={{ display: getStockImageUrl(stockId) ? 'none' : 'flex' }}
                            >
                                {getStockName(stockId).charAt(0)}
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            {stockList && stockList.length > 0 ? (
                                <div className="w-full max-w-64 relative z-20">
                                    <ModernStockSelector
                                        stockList={stockList}
                                        selectedStockId={stockId}
                                        onStockChange={onStockChange}
                                    />
                                </div>
                            ) : (
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                    {getStockName(stockId)}
                                </h3>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                                <p className="text-xs sm:text-sm text-gray-500">실시간 차트</p>
                            </div>
                        </div>
                    </div>

                    {/* 가격 정보 - 오버플로우 완전 방지 */}
                    <div className="text-right flex-shrink-0 min-w-0 max-w-32 sm:max-w-none">
                        {/* 현재가 */}
                        <div className={`text-sm sm:text-xl font-bold mb-1 ${getPriceChangeStyle()} truncate`}>
                            ₩{getCurrentPrice().toLocaleString()}
                        </div>

                        {/* 변동 정보 */}
                        <div className="flex items-center justify-end gap-1 min-w-0">
                            <div className="text-xs text-gray-600 flex-shrink-0">현재가</div>
                            <div className={`text-xs font-medium ${getPriceChangeStyle()} min-w-0 truncate`}>
                                <span className="mr-0.5">{getPriceChangeIcon()}</span>
                                <span className="truncate">
                                    {Math.abs(priceChange.amount).toLocaleString()} ({Math.abs(priceChange.percent).toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200"></div>
            </div>
        </div>
    );
};

export default StockChartHeader;