import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;
let subscriptions = new Map();
let isConnecting = false;
let connectionPromise = null;

// 소켓 연결
export const connect = () => {
    if (client?.connected) {
        return Promise.resolve(client);
    }
    
    if (isConnecting && connectionPromise) {
        return connectionPromise;
    }

    isConnecting = true;

    connectionPromise = new Promise((resolve, reject) => {
        try {
            const socket = new SockJS(import.meta.env.VITE_APP_BASE_API_BASE_URL + '/ws');
            client = Stomp.over(socket);

            client.connect({},
                () => {
                    console.log('WebSocket 연결 성공');
                    isConnecting = false;
                    resolve(client);
                },
                (error) => {
                    console.error('WebSocket 연결 실패:', error);
                    isConnecting = false;
                    client = null;
                    connectionPromise = null;
                    reject(error);
                }
            );

        } catch (error) {
            console.error('WebSocket 초기화 실패:', error);
            isConnecting = false;
            connectionPromise = null;
            reject(error);
        }
    });

    return connectionPromise;
};

// 연결 해제
export const disconnect = () => {
    unsubscribeAll();
    
    if (client?.connected) {
        try {
            client.disconnect();
            console.log('WebSocket 연결 해제');
        } catch (error) {
            console.error('연결 해제 오류:', error);
        }
    }
    
    client = null;
    isConnecting = false;
    connectionPromise = null;
};

// 주식 데이터 구독
export const subscribeToStock = async (stockId, onStockUpdate) => {
    if (isStockSubscribed(stockId)) {
        return subscriptions.get(stockId);
    }
    try {
        await connect();
        
        if (!client?.connected) {
            throw new Error('WebSocket 연결 실패');
        }

        const subscription = client.subscribe(`/topic/stock${stockId}/update`, (message) => {
            try {
                onStockUpdate(stockId, message.body);
            } catch (error) {
                console.error(`주식 ${stockId} 처리 오류:`, error);
            }
        });

        subscriptions.set(stockId, subscription);
        console.log(`주식 ${stockId} 구독`);
        
        return subscription;

    } catch (error) {
        console.error(`주식 ${stockId} 구독 실패:`, error);
        return null;
    }
};

// 특정 주식 구독 해제
export const unsubscribeStock = (stockId) => {
    const subscription = subscriptions.get(stockId);
    if (subscription) {
        try {
            subscription.unsubscribe();
            subscriptions.delete(stockId);
        } catch (error) {
            console.error(`주식 ${stockId} 구독 해제 실패:`, error);
        }
    }
};

// 모든 구독 해제
export const unsubscribeAll = () => {
    subscriptions.forEach((subscription, stockId) => {
        try {
            subscription.unsubscribe();
        } catch (error) {
            console.error(`주식 ${stockId} 구독 해제 실패:`, error);
        }
    });
    subscriptions.clear();
};

// 구독 상태 확인
export const isStockSubscribed = (stockId) => subscriptions.has(stockId);

// 구독 목록
export const getSubscribedStocks = () => Array.from(subscriptions.keys());

// 연결 상태 확인
export const isConnected = () => client?.connected || false;

// 연결 대기 함수
export const waitForConnection = async () => {
    if (client?.connected) {
        return true;
    }

    // 연결 시도
    try {
        await connect();
        return true;
    } catch (error) {
        console.error('연결 대기 실패:', error);
        return false;
    }
};