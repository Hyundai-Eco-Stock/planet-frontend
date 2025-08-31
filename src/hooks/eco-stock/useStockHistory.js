import { useState, useEffect, useCallback, useRef } from 'react';
import { getEcoStockHistory } from '@/api/eco_stock_history/ecoStockHistory.api';

export const useStockHistory = (selectedStock) => {
  const [initialChartData, setInitialChartData] = useState({});
  const [currentStockData, setCurrentStockData] = useState(null);
  const [previousStockData, setPreviousStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 최신 current를 항상 참조하기 위한 ref (stale closure 방지)
  const currentRef = useRef(null);
  useEffect(() => { currentRef.current = currentStockData; }, [currentStockData]);

  useEffect(() => {
    if (!selectedStock) return;

    const fetchStockHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const historyData = await getEcoStockHistory(selectedStock);
        const ohlcArr = historyData?.ohlcData ?? [];
        const volArr = historyData?.volumeData ?? [];

        const last = ohlcArr[ohlcArr.length - 1];
        const prev = ohlcArr[ohlcArr.length - 2];

        const latestData = last
          ? { ohlcData: last, volumeData: volArr[volArr.length - 1] }
          : null;
        const latestBeforeData = prev
          ? { ohlcData: prev, volumeData: volArr[volArr.length - 2] }
          : null;

        setCurrentStockData(latestData);
        setPreviousStockData(latestBeforeData);
        setInitialChartData(prevMap => ({ ...prevMap, [selectedStock]: historyData }));
      } catch (err) {
        console.error('주식 히스토리 조회 실패:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // 종목 바뀌면 초기화 후 로드
    setInitialChartData(prev => ({ ...prev, [selectedStock]: null }));
    setCurrentStockData(null);
    setPreviousStockData(null);
    currentRef.current = null;

    fetchStockHistory();
  }, [selectedStock]);

  // ✅ 실시간 업데이트: 항상 "직전 값"을 previous로 넣고 current 갱신
  const updateCurrentStockData = useCallback((newPoint) => {
    if (!selectedStock || !newPoint) return;

    // 소켓 payload 모양 보정 (필요 시)
    const next =
      newPoint.ohlcData
        ? newPoint
        : { ohlcData: newPoint, volumeData: newPoint.volumeData ?? null };

    // 직전 current를 previous로
    setPreviousStockData(currentRef.current ?? null);
    // 현재값 업데이트
    setCurrentStockData(next);
    // ref 최신화는 useEffect가 해줌
  }, [selectedStock]);

  return {
    initialChartData,
    currentStockData,
    previousStockData,
    loading,
    error,
    updateCurrentStockData,
  };
};
