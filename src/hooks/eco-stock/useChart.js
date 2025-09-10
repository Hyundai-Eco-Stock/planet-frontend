import { useRef, useEffect, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { chartConfig, LAYOUT, priceScaleConfig, THEME } from '@/config/chartConfig';

export const useChart = (data, height = 400) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candleSeriesRef = useRef();
    const volumeSeriesRef = useRef();
    const separatorSeriesRef = useRef();
    const resizeObserverRef = useRef();
    const isInitializedRef = useRef(false);
    const lastDataTimeRef = useRef(null); // 마지막 데이터 시간 추적

        // ✅ 차트 데이터를 직접 관리
    const chartDataRef = useRef([]);
    const volumeDataRef = useRef([]);


    const createExtendedTimeRange = () => {
        const now = Math.floor(Date.now() / 1000);
        return [{ time: now - 86400, value: 1 }, { time: now + 86400, value: 1 }];
    };

    const getVolumeColor = useCallback((colorKey, theme) => {
        switch (colorKey) {
            case "BUY":
                return theme.volume.buy;
            case "SELL":
                return theme.volume.sell;
            case "EMPTY":
                return theme.volume.empty;
            case "SAME":
                return theme.volume.same;
            default:
                return theme.text;
        }
    }, []);

    // 차트 초기화 (data가 변경될 때만)
    useEffect(() => {
        if (!data || data.length === 0) return;

        // 기존 차트가 있다면 제거
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
            separatorSeriesRef.current = null;
            isInitializedRef.current = false;
            lastDataTimeRef.current = null;
        }

        console.log('📊 차트 초기화 시작 -', data.length, '개 데이터');

        const chart = createChart(
            chartContainerRef.current,
            chartConfig.base(chartContainerRef.current.clientWidth, height)
        );

        chartRef.current = chart;

        const ohlcData = data.ohlcData;
        const volumeData = data.volumeData.map(volume => ({
            ...volume,
            color: getVolumeColor(volume.color, THEME)
        }));
        const separatorData = createExtendedTimeRange();

                // ✅ 초기 데이터를 ref에 저장
        chartDataRef.current = [...ohlcData];
        volumeDataRef.current = [...volumeData];

        const candleSeries = chart.addCandlestickSeries(chartConfig.candlestick);
        const volumeSeries = chart.addHistogramSeries(chartConfig.volume);
        const separatorSeries = chart.addLineSeries(chartConfig.separator);

        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;
        separatorSeriesRef.current = separatorSeries;

        chart.priceScale(LAYOUT.priceScaleIds.main).applyOptions(priceScaleConfig.main);
        chart.priceScale(LAYOUT.priceScaleIds.volume).applyOptions(priceScaleConfig.volume);
        chart.priceScale(LAYOUT.priceScaleIds.separator).applyOptions(priceScaleConfig.separator);

        separatorSeries.createPriceLine({
            price: 1,
            color: THEME.separator,
            lineWidth: 1,
            lineStyle: 0,
            axisLabelVisible: false,
            title: ''
        });

        // 초기 차트 데이터 삽입
        candleSeries.setData(chartDataRef.current);
        volumeSeries.setData(volumeDataRef.current);
        separatorSeries.setData(separatorData);

        // 마지막 데이터 시간 저장
        if (ohlcData.length > 0) {
            lastDataTimeRef.current = ohlcData[ohlcData.length - 1].time;

            const realDataPoints = ohlcData.filter(item => !item.isEmpty);
            const visibleRealDataCount = Math.min(10, realDataPoints.length);
            const startIndex = Math.max(0, realDataPoints.length - visibleRealDataCount);
            const firstRealTime = realDataPoints[startIndex].time;

            chart.timeScale().setVisibleRange({
                from: firstRealTime - 300,
                to: lastDataTimeRef.current + 300
            });
        }

        isInitializedRef.current = true;
        console.log('✅ 차트 초기화 완료');

        return () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                candleSeriesRef.current = null;
                volumeSeriesRef.current = null;
                separatorSeriesRef.current = null;
                isInitializedRef.current = false;
                lastDataTimeRef.current = null;
                chartDataRef.current = [];
                volumeDataRef.current = [];
            }
        };
    }, [data, height, getVolumeColor]);

    // 리사이즈 처리
    useEffect(() => {
        const handleResize = (entries) => {
            const { width, height: containerHeight } = entries[0].contentRect;
            if (chartRef.current) {
                // 현재 보이는 범위 저장
                const timeScale = chartRef.current.timeScale();
                const visibleRange = timeScale.getVisibleRange();

                chartRef.current.applyOptions({
                    width,
                    height: containerHeight || height
                });

                // 리사이즈 후 기존 범위 복원
                setTimeout(() => {
                    if (chartRef.current && visibleRange && visibleRange.from && visibleRange.to) {
                        timeScale.setVisibleRange(visibleRange);
                    }
                }, 0);
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }
        resizeObserverRef.current = resizeObserver;

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, [height]);
    // 🔥 간단하고 자연스러운 실시간 업데이트 함수
// 데이터 배열을 직접 관리하는 업데이트 함수
const updateChart = useCallback((currentData) => {
    console.log('차트 업데이트 호출:', currentData);

    if (!currentData || !isInitializedRef.current || !candleSeriesRef.current) {
        console.log('차트 업데이트 조건 실패');
        return;
    }

    const ohlc = currentData.ohlcData;
    if (!ohlc || typeof ohlc.time !== 'number' || isNaN(ohlc.time)) {
        console.error('유효하지 않은 OHLC 데이터:', ohlc);
        return;
    }

    const cleanOhlc = {
        time: ohlc.time,
        open: Number(ohlc.open),
        high: Number(ohlc.high),
        low: Number(ohlc.low),
        close: Number(ohlc.close),
    };

    console.log('처리할 cleanOhlc:', cleanOhlc);
    console.log('현재 chartData 마지막:', chartDataRef.current[chartDataRef.current.length - 1]);

    try {
        const currentChartData = [...chartDataRef.current];
        const currentVolumeData = [...volumeDataRef.current];
        
        if (!lastDataTimeRef.current || cleanOhlc.time > lastDataTimeRef.current) {
            // 새로운 분봉 추가
            console.log('새 분봉 추가:', cleanOhlc);
            
            currentChartData.push(cleanOhlc);
            chartDataRef.current = currentChartData;
            lastDataTimeRef.current = cleanOhlc.time;
            
            // 볼륨 데이터도 추가
            if (currentData.volumeData) {
                const cleanVolume = {
                    time: cleanOhlc.time,
                    value: Number(currentData.volumeData.value) || 0,
                    color: getVolumeColor(currentData.volumeData.color, THEME),
                };
                currentVolumeData.push(cleanVolume);
                volumeDataRef.current = currentVolumeData;
            }
            
            // 전체 데이터 다시 설정
            candleSeriesRef.current.setData(currentChartData);
            if (volumeSeriesRef.current) {
                volumeSeriesRef.current.setData(currentVolumeData);
            }
            
            console.log('새 분봉 setData 완료');
            
        } else if (cleanOhlc.time === lastDataTimeRef.current) {
            // 마지막 분봉 업데이트 
            console.log('같은 분봉 업데이트:', cleanOhlc);
            
            const lastIndex = currentChartData.length - 1;
            if (lastIndex >= 0) {
                // 기존 OHLC와 새 데이터 병합 (high/low 누적)
                const existingOhlc = currentChartData[lastIndex];
                const updatedOhlc = {
                    time: cleanOhlc.time,
                    open: existingOhlc.open, // 첫 open 유지
                    high: Math.max(existingOhlc.high, cleanOhlc.high),
                    low: Math.min(existingOhlc.low, cleanOhlc.low),
                    close: cleanOhlc.close, // 최신 close
                };
                
                currentChartData[lastIndex] = updatedOhlc;
                chartDataRef.current = currentChartData;
                
                // 볼륨도 업데이트
                if (currentData.volumeData && currentVolumeData.length > 0) {
                    const volumeIndex = currentVolumeData.length - 1;
                    const cleanVolume = {
                        time: cleanOhlc.time,
                        value: Number(currentData.volumeData.value) || 0,
                        color: getVolumeColor(currentData.volumeData.color, THEME),
                    };
                    currentVolumeData[volumeIndex] = cleanVolume;
                    volumeDataRef.current = currentVolumeData;
                }
                
                // 전체 데이터 다시 설정
                candleSeriesRef.current.setData(currentChartData);
                if (volumeSeriesRef.current) {
                    volumeSeriesRef.current.setData(currentVolumeData);
                }
                
                console.log('분봉 업데이트 setData 완료:', updatedOhlc);
            }
        } else {
            console.log('과거 데이터 무시:', cleanOhlc.time, 'vs', lastDataTimeRef.current);
        }
    } catch (error) {
        console.error('차트 업데이트 에러:', error, cleanOhlc);
    }
}, [getVolumeColor]);
    // 수동으로 최신 데이터로 이동하는 함수 (필요시 사용)
    const scrollToLatest = useCallback(() => {
        if (!chartRef.current || !lastDataTimeRef.current) return;

        const timeScale = chartRef.current.timeScale();
        const currentRange = timeScale.getVisibleRange();
        const rangeSize = currentRange.to - currentRange.from;

        timeScale.setVisibleRange({
            from: lastDataTimeRef.current - rangeSize + 300,
            to: lastDataTimeRef.current + 300
        });
    }, []);

    return {
        chartContainerRef,
        isInitialized: isInitializedRef.current,
        updateChart,
        scrollToLatest // 필요시 최신으로 스크롤하는 함수
    };
};