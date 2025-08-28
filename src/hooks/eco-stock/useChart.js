import { useRef, useEffect } from 'react';
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

    const createExtendedTimeRange = () => {
        const now = Math.floor(Date.now() / 1000);
        return [{ time: now - 86400, value: 1 }, { time: now + 86400, value: 1 }];
    };

    // 차트 초기화
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

        //초기 차트 데이터 삽입
        candleSeries.setData(ohlcData);
        volumeSeries.setData(volumeData);
        separatorSeries.setData(separatorData);
        
        if (ohlcData.length > 0) {
            const lastTime = ohlcData[ohlcData.length - 1].time;
            const realDataPoints = ohlcData.filter(item => !item.isEmpty);

            // ✅ 최근 10개의 실제 데이터 보여주기
            const visibleRealDataCount = Math.min(10, realDataPoints.length);
            const startIndex = Math.max(0, realDataPoints.length - visibleRealDataCount);
            const firstRealTime = realDataPoints[startIndex].time;

            chart.timeScale().setVisibleRange({
                from: firstRealTime - 300,
                to: lastTime + 300
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
            }
        };
    }, [data, height]);

    // 리사이즈 처리
    useEffect(() => {
        const handleResize = (entries) => {
            const { width, height: containerHeight } = entries[0].contentRect;
            if (chartRef.current) {
                const timeScale = chartRef.current.timeScale();
                const visibleRange = timeScale.getVisibleRange();

                chartRef.current.applyOptions({
                    width,
                    height: containerHeight || height
                });

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

    // 실시간 업데이트 함수 (간소화)
    const updateChart = (currentData) => {
        if (!currentData || !isInitializedRef.current || !candleSeriesRef.current) {
            return;
        }

        const ohlc = currentData.ohlcData
        const volume = currentData.volumeData ? {
            time: currentData.volumeData.time,
            value: currentData.volumeData.value,
            color: getVolumeColor(currentData.volumeData.color, THEME)
        } : null;

        // 캔들스틱 업데이트
        if (ohlc && candleSeriesRef.current) {
            candleSeriesRef.current.update(ohlc);

            // 새 데이터가 보이는 범위를 벗어났을 때만 자동 스크롤
            const visibleRange = chartRef.current.timeScale().getVisibleRange();
            if (visibleRange && ohlc.time > visibleRange.to) {
                const timeRange = visibleRange.to - visibleRange.from;
                chartRef.current.timeScale().setVisibleRange({
                    from: ohlc.time - timeRange,
                    to: ohlc.time
                });
            }
        }

        // 볼륨 업데이트
        if (volume && volumeSeriesRef.current) {
            volumeSeriesRef.current.update(volume);
        }
    };

    const getVolumeColor = (colorKey, theme) => {
        switch (colorKey) {
            case "BUY":
                return theme.volume.buy;
            case "SELL":
                return theme.volume.sell;
            case "EMPTY":
                return theme.volume.empty; // EMPTY → 흐린 회색
            case "SAME":
                return theme.volume.same; // EMPTY → 흐린 회색
            default:
                return theme.text; // fallback
        }
    };

    return {
        chartContainerRef,
        isInitialized: isInitializedRef.current,
        updateChart
    };
};