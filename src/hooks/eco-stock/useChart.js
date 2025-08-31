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
        candleSeries.setData(ohlcData);
        volumeSeries.setData(volumeData);
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
    const updateChart = useCallback((currentData) => {
        if (!currentData || !isInitializedRef.current || !candleSeriesRef.current) {
            return;
        }

        const ohlc = currentData.ohlcData;
        const volume = currentData.volumeData ? {
            time: currentData.volumeData.time,
            value: currentData.volumeData.value,
            color: getVolumeColor(currentData.volumeData.color, THEME)
        } : null;

        // ✅ 단순하게 데이터만 업데이트 - Lightweight Charts가 알아서 처리
        if (ohlc && candleSeriesRef.current) {
            if (!lastDataTimeRef.current || ohlc.time > lastDataTimeRef.current) {
                candleSeriesRef.current.update(ohlc);
                lastDataTimeRef.current = ohlc.time;
                console.log('새로운 캔들 데이터 추가:', ohlc.time);
            } else if (ohlc.time === lastDataTimeRef.current) {
                candleSeriesRef.current.update(ohlc);
                console.log('기존 캔들 데이터 수정:', ohlc.time);
            }
        }

        // 볼륨 데이터 업데이트
        if (volume && volumeSeriesRef.current) {
            volumeSeriesRef.current.update(volume);
        }

        // 🚫 setVisibleRange 강제 호출 제거
        // Lightweight Charts가 자연스럽게 처리하도록 놔둠

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