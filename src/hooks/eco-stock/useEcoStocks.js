import { useState, useEffect } from 'react';
import { getAllEcoStocks } from '@/api/eco_stock_info/ecoStockInfo.api';

export const useEcoStocks = () => {
    const [stockList, setStockList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEcoStocks = async () => {
            try {
                setLoading(true);
                setError(null);
                const stocks = await getAllEcoStocks();
                setStockList(stocks);
                console.log('EcoStock 목록:', stocks);
            } catch (err) {
                console.error('EcoStock 조회 실패:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEcoStocks();
    }, []);

    return { stockList, loading, error };
};