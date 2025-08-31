import { useState } from "react";
import { useEcoStocks } from "@/hooks/eco-stock/useEcoStocks";
import { useStockHistory } from "@/hooks/eco-stock/useStockHistory";
import StockChart from "@/components/eco-stock/StockChart";
import StockChartHeader from "@/components/eco-stock/StockChartHeader";
import StockConnection from "@/components/eco-stock/StockConnection";
import MyPortfolio from "@/components/eco-stock/MyPortfolio";
import { useMemo } from "react";

const EcoStockMain = () => {
    const [selectedStock, setSelectedStock] = useState(1);

    // 커스텀 훅들 사용
    const { stockList, loading: stockListLoading } = useEcoStocks();
    const {
        initialChartData, // 초기 데이터
        currentStockData, // 실시간 데이터
        previousStockData,
        loading: historyLoading,
        updateCurrentStockData
    } = useStockHistory(selectedStock);

    // 주식 선택 변경 처리
    const handleStockChange = (newStockId) => {
        setSelectedStock(newStockId);
    };

    const currentStockInfo = useMemo(() =>
        stockList?.find(stock => stock.id === selectedStock),
        [stockList, selectedStock]
    );

    // stockList에서 해당 stockId의 이름 찾기
    const getStockName = (id) => {
        const stock = stockList?.find(stock => stock.id === id);
        return stock ? stock.name : `주식 ${id}`;
    };

    // 웹소켓에서 데이터 업데이트 처리
    const handleStockDataUpdate = (stockId, newChartPoint) => {
        if (stockId === selectedStock) {
            console.log('현재 주식 데이터 업데이트:', newChartPoint);
            updateCurrentStockData(newChartPoint);
        }
    };

    return (
        <div>
            {/* 웹소켓 연결 */}
            <StockConnection
                stockListLoading={stockListLoading}
                stockList={stockList}
                onStockDataUpdate={handleStockDataUpdate}
                selectedStock={selectedStock}
                onStockChange={handleStockChange}
            />
            {/* 차트 헤더 */}
            <StockChartHeader
                stockList={stockList}
                stockId={selectedStock}
                onStockChange={handleStockChange}
                getStockName={getStockName}
                currentData={currentStockData}
                previousStockData={previousStockData}
            />
            {/* 차트  */}
            <StockChart
                currentData={currentStockData}
                initialData={initialChartData[selectedStock]} // 초기 데이터만
                loading={historyLoading}
                previousStockData={previousStockData}
            />
            {/* 해당 차트의 포폴  */}
            <MyPortfolio currentData={currentStockData} stockInfo={currentStockInfo} />
        </div>
    );
}

export default EcoStockMain;