import { useState, useEffect, useCallback } from 'react';
import { connect, disconnect, subscribeToStock, waitForConnection, unsubscribeAll, isConnected } from "@/util/socket.js";

export const useWebSocket = (selectedStock, onStockDataUpdate) => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // 주식 데이터 업데이트 핸들러
    const handleStockUpdate = useCallback((stockId, data) => {
        const parsedData = JSON.parse(data);
        console.log(data);
        
        if (onStockDataUpdate) {
            onStockDataUpdate(stockId, parsedData);
        }
    }, [onStockDataUpdate]);

    // 특정 주식 구독하기
    // 기존 전부 제거후 stockId꺼 구독
    const subscribeToSingleStock = useCallback(async (stockId) => {
        if (!isConnected()) return;

        unsubscribeAll();
        subscribeToStock(stockId, handleStockUpdate);
    }, [handleStockUpdate]);

    // 웹소켓 연결 및 초기 구독
    useEffect(() => {
        const initializeConnection = async () => {
            try {
                setConnectionStatus('connecting');
                connect();
                await waitForConnection();
                setConnectionStatus('connected');
                
                await subscribeToSingleStock(selectedStock);
                
            } catch (error) {
                setConnectionStatus('failed');
                console.log(error);
            }
        };

        initializeConnection();
        
        return () => {
            setConnectionStatus('disconnected');
            disconnect();
        };
    }, [selectedStock, subscribeToSingleStock]);

    // selectedStock 변경 시 구독 변경
    useEffect(() => {
        if (connectionStatus === 'connected' && selectedStock) {
            subscribeToSingleStock(selectedStock);
        }
    }, [selectedStock, connectionStatus, subscribeToSingleStock]);

    return { connectionStatus };
};