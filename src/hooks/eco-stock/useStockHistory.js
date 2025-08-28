import { useState, useEffect } from 'react';
import { getEcoStockHistory } from '@/api/eco_stock_history/ecoStockHistory.api';

export const useStockHistory = (selectedStock) => {
    const [chartData, setChartData] = useState({});
    const [currentStockData, setCurrentStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedStock) return;

        const fetchStockHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                const historyData = await getEcoStockHistory(selectedStock);
                const latestData = {
                    ohlcData: historyData.ohlcData[historyData.ohlcData.length - 1],
                    volumeData: historyData.volumeData[historyData.volumeData.length - 1]
                };
                setCurrentStockData(latestData);
                setChartData({ [selectedStock]: historyData });
                console.log('주식 히스토리:', historyData);
            } catch (err) {
                console.error('주식 히스토리 조회 실패:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        // 주식이 변경되면 데이터 초기화 후 새로 로드
        setChartData({});
        setCurrentStockData(null);
        fetchStockHistory();
    }, [selectedStock]);

    const updateCurrentStockData = (newData) => {
        setCurrentStockData(newData);

        setChartData((prev) => {
            const prevData = prev[selectedStock] || { ohlcData: [], volumeData: [] };

            return {
                ...prev,
                [selectedStock]: {
                    ohlcData: [...prevData.ohlcData, newData.ohlcData],
                    volumeData: [...prevData.volumeData, newData.volumeData],
                },
            };
        });
    };

    return {
        chartData,
        currentStockData,
        loading,
        error,
        updateCurrentStockData
    };
};
