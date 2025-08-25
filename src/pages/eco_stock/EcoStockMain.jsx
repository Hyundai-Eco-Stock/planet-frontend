import { useState } from "react";
import { useEcoStocks } from "@/hooks/eco-stock/useEcoStocks";

const EcoStockMain = () => {
    const [selectedStock, setSelectedStock] = useState(1);

    // 커스텀 훅들 사용
    const { stockList, loading: stockListLoading } = useEcoStocks();

    // 주식 선택 변경 처리
    const handleStockChange = (newStockId) => {
        setSelectedStock(newStockId);
    };

    const currentStockInfo = useMemo(() =>
        stockList?.find(stock => stock.id === selectedStock),
        [stockList, selectedStock]
    );

    // stockList에서 해당 stockId의 이름 찾기
    const getStockName = (id) => {
        const stock = stockList?.find(stock => stock.id === id);
        return stock ? stock.name : `주식 ${id}`;
    };

    return (
        <div>
        </div>
    );
}

export default EcoStockMain;