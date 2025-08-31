import { useEffect } from 'react';
import { useChart } from '@/hooks/eco-stock/useChart';

const StockChart = ({ currentData, initialData, loading, height = 400 }) => {
    const { chartContainerRef, updateChart } = useChart(initialData, height);

    // 실시간 데이터만 update 함수로 처리
    useEffect(() => {
        if (currentData && initialData && initialData.ohlcData && initialData.ohlcData.length > 0) {
            updateChart(currentData);
        }
    }, [currentData, updateChart,initialData]);

    // 로딩 상태
    if (loading) {
        return (
            <div className="p-6 min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">차트 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 데이터 없음
    if (!initialData || initialData.length === 0) {
        return (
            <div className="p-6 min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">차트 데이터가 없습니다</h3>
                    <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
                </div>
            </div>
        );
    }

    // 정상 차트 렌더링
    return (
        <div className="w-full h-full relative">
            <div
                ref={chartContainerRef}
                className="w-full rounded-xl overflow-hidden border border-gray-300 bg-white"
                style={{ height: `${height}px` }}
            />
        </div>
    );
};

export default StockChart;