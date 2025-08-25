const StockConnection = ({ stockListLoading, stockList }) => {
    // 주식 목록 로딩 중
    if (stockListLoading) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-gray-100 mb-6">
                <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-gray-600 font-medium">주식 목록을 불러오는 중...</span>
                </div>
            </div>
        );
    }

    // 주식 목록 없음
    if (!stockList?.length) {
        return (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                <div className="text-center">
                    <div className="text-4xl mb-3">📉</div>
                    <p className="text-gray-600 font-medium">사용 가능한 주식이 없습니다</p>
                </div>
            </div>
        );
    }

    // 정상 상태일 때는 아무 것도 안 보여줌
    return null;
};

export default StockConnection;
