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
        if (priceChange.amount > 0) return 'text-green-600';
        if (priceChange.amount < 0) return 'text-red-600';
        return 'text-gray-600'; // 0%는 회색
    };

    const getPriceChangeIcon = () => {
        if (priceChange.amount > 0) return '▲';
        if (priceChange.amount < 0) return '▼';
        return '—'; // 0% 아이콘
    };

    return (
        <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-3">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">에코 스톡</h2>
                            <p className="text-sm text-gray-500">친환경 기업 투자로 지구와 함께 성장하세요</p>
                        </div>
                    </div>
                    <EcoStockGuide />
                </div>

                <div className="flex items-center justify-between w-full mb-4 pt-2">
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

                    {/* CHANGED: 항상 렌더링 (0%도 보이게) */}
                    <div className="text-right">
                        {/* 현재가 */}
                        <div className={`text-xl font-bold mb-1 ${getPriceChangeStyle()}`}>
                            ₩{getCurrentPrice().toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <div className="text-sm text-gray-600">현재가</div>
                            <div className={`text-sm font-medium ${getPriceChangeStyle()}`}>
                                <span className="mr-1">{getPriceChangeIcon()}</span>
                                <span>
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
