import { useEffect } from 'react';
import { useChart } from '@/hooks/eco-stock/useChart';

const StockChart = ({ currentData, initialData, loading, height = 350 }) => {
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
            <div className="p-4 min-h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-gray-600 font-medium">차트 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 데이터 없음
    if (!initialData || initialData.length === 0) {
        return (
            <div className="p-4 min-h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">차트 데이터가 없습니다</h3>
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