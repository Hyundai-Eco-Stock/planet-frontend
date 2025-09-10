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

  const normalizeToMinute = useCallback((timestamp) => {
    const num = Math.floor(Number(timestamp) / 1000) < 1e9
      ? Number(timestamp)        // 이미 초 단위면 그대로
      : Math.floor(Number(timestamp) / 1000); // 밀리초면 초로 변환

    return Math.floor(num / 60) * 60;
  }, []);

  useEffect(() => {
    if (!selectedStock) return;

    const fetchStockHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const historyData = await getEcoStockHistory(selectedStock);
        console.log('📊 초기 히스토리 데이터:', historyData);

        const ohlcArr = historyData?.ohlcData ?? [];
        const volArr = historyData?.volumeData ?? [];
        // 1. 필요한 모든 데이터 조각을 미리 준비합니다.
        // 1-1. 기존 배열에서 가져오는 데이터
        const historicalLastOhlc = ohlcArr[ohlcArr.length - 1];
        const historicalLastVol = volArr[volArr.length - 1];
        const historicalPrevOhlc = ohlcArr[ohlcArr.length - 2];
        const historicalPrevVol = volArr[volArr.length - 2];

        // 1-2. 실시간으로 들어온 데이터 (정규화 포함)
        const realTimeOhlc = historyData.lastOhlcData
          ? { ...historyData.lastOhlcData, time: normalizeToMinute(historyData.lastOhlcData.time) }
          : null;
        const realTimeVol = historyData.lastVolumeData
          ? { ...historyData.lastVolumeData, time: normalizeToMinute(historyData.lastVolumeData.time) }
          : null;


        // 2. 변수를 미리 선언합니다.
        let latestData = null;
        let latestBeforeData = null;

        // 3. 실시간 데이터(realTimeOhlc) 유무에 따라 최종 데이터를 구성합니다.
        if (realTimeOhlc) {
          // 실시간 데이터가 있으면:
          // - latestData는 실시간 데이터가 됩니다.
          // - latestBeforeData는 기존 배열의 마지막 데이터가 됩니다.
          latestData = {
            ohlcData: realTimeOhlc,
            volumeData: realTimeVol
          };

          latestBeforeData = historicalLastOhlc ? {
            ohlcData: { ...historicalLastOhlc, time: normalizeToMinute(historicalLastOhlc.time) },
            volumeData: historicalLastVol
          } : null;

        } else {
          // 실시간 데이터가 없으면:
          // - 기존 로직과 동일하게 처리합니다.
          latestData = historicalLastOhlc ? {
            ohlcData: { ...historicalLastOhlc, time: normalizeToMinute(historicalLastOhlc.time) },
            volumeData: historicalLastVol
          } : null;

          latestBeforeData = historicalPrevOhlc ? {
            ohlcData: { ...historicalPrevOhlc, time: normalizeToMinute(historicalPrevOhlc.time) },
            volumeData: historicalPrevVol
          } : null;
        }

        // 이제 latestData와 latestBeforeData를 state에 안전하게 설정할 수 있습니다.
        setCurrentStockData(latestData);
        setPreviousStockData(latestBeforeData);

        // ✅ 초기 차트 데이터도 시간 정규화
        if (historyData && ohlcArr.length > 0) {
          const normalizedHistoryData = {
            ...historyData,
            ohlcData: [
              // 기존 데이터들은 그대로
              ...ohlcArr.slice(0, -1),
              // 마지막 데이터만 정규화
              {
                ...ohlcArr[ohlcArr.length - 1],
                time: ohlcArr[ohlcArr.length - 1].time
              }
            ],
            volumeData: [
              // 기존 볼륨 데이터들은 그대로
              ...volArr.slice(0, -1),
              // 마지막 볼륨 데이터만 정규화
              {
                ...volArr[volArr.length - 1],
                time: volArr[volArr.length - 1].time
              }
            ]
          };
          setInitialChartData(prevMap => ({ ...prevMap, [selectedStock]: normalizedHistoryData }));
        } else {
          setInitialChartData(prevMap => ({ ...prevMap, [selectedStock]: historyData }));
        }
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

    const normalizeTimeInData = (data) => {
      if (!data || !data.time) return data;
      return {
        ...data,
        time: normalizeToMinute(data.time)
      };
    };

    const next = newPoint.ohlcData
      ? {
          ...newPoint,
          ohlcData: normalizeTimeInData(newPoint.ohlcData),
          volumeData: normalizeTimeInData(newPoint.volumeData)
        }
      : {
          ohlcData: normalizeTimeInData(newPoint),
          volumeData: normalizeTimeInData(newPoint.volumeData)
        };

    const newTime = next.ohlcData?.time;
    const currentTime = currentRef.current?.ohlcData?.time;

    if (newTime && currentTime && newTime === currentTime) {
      // 같은 분봉 - 데이터 병합, minuteBasedPrevious는 유지
      const existing = currentRef.current.ohlcData;
      const merged = {
        ohlcData: {
          ...next.ohlcData,
          open: existing.open,
          high: Math.max(existing.high, next.ohlcData.high),
          low: Math.min(existing.low, next.ohlcData.low),
          close: next.ohlcData.close
        },
        volumeData: next.volumeData
      };
      setCurrentStockData(merged);
    } else {
      // 새로운 분봉 - minuteBasedPrevious 업데이트
      setPreviousStockData(currentRef.current ?? null);
      setCurrentStockData(next);
    }
  }, [selectedStock, normalizeToMinute]);

  return {
    initialChartData,
    currentStockData,
    previousStockData,
    loading,
    error,
    updateCurrentStockData,
  };
};
