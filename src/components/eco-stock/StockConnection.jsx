import { useWebSocket } from "@/hooks/eco-stock/useWebSocket";

const StockConnection = ({ stockListLoading, stockList, onStockDataUpdate, selectedStock }) => {
    // ✅ 훅만 호출해서 구독 유지, UI는 반환 안 함
    useWebSocket(selectedStock, onStockDataUpdate);

    // 로딩/없음 처리만 남기고 UI는 간단히
    if (stockListLoading) return null;
    if (!stockList?.length) return null;

    return null; // UI 안 보여줌
};

export default StockConnection;