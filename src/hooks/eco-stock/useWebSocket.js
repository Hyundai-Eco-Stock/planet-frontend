import { useState, useEffect, useCallback, useRef } from 'react';
import {
    connect,
    disconnect,
    subscribeToStock,
    unsubscribeAll,
    isConnected
} from "@/util/socket.js";

export const useWebSocket = (selectedStock, onStockDataUpdate) => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const prevStockIdRef = useRef(null); // 이전 주식 ID 추적

    // 메시지 핸들러
    const handleStockUpdate = useCallback((stockId, data) => {
        try {
            const parsedData = JSON.parse(data);
            // console.log('수신:', parsedData); // DEBUG 시 사용
            onStockDataUpdate?.(stockId, parsedData);
        } catch (error) {
            console.error('데이터 파싱 실패:', error);
        }
    }, [onStockDataUpdate]);

    // 단일 주식 구독
    const subscribeToSingleStock = useCallback(async (stockId) => {
        // 같은 주식이면 재구독하지 않음
        if (prevStockIdRef.current === stockId) return;

        unsubscribeAll();
        await subscribeToStock(stockId, handleStockUpdate);
        prevStockIdRef.current = stockId;
    }, [handleStockUpdate]);

    // 최초 mount 시 연결
    useEffect(() => {
        let isMounted = true;

        const initializeConnection = async () => {
            try {
                setConnectionStatus('connecting');
                await connect();
                if (!isMounted) return;

                setConnectionStatus('connected');
                await subscribeToSingleStock(selectedStock);
            } catch (error) {
                if (!isMounted) return;
                setConnectionStatus('failed');
                console.error('웹소켓 초기화 실패:', error);
            }
        };

        initializeConnection();

        return () => {
            isMounted = false;
            setConnectionStatus('disconnected');
            disconnect();
            prevStockIdRef.current = null;
        };
    }, []); // 초기 1회 실행

    // selectedStock 변경 시 구독 변경
    useEffect(() => {
        if (connectionStatus !== 'connected' || !selectedStock) return;
        subscribeToSingleStock(selectedStock);
    }, [selectedStock, connectionStatus, subscribeToSingleStock]);

    return { connectionStatus };
};
