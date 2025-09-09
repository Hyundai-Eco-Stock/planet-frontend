import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import useAuthStore from "@/store/authStore";

let client = null;
let subscriptions = new Map();
let subscriptionCallbacks = new Map(); // 재구독을 위한 콜백 저장
let isConnecting = false;
let connectionPromise = null;

let retryCount = 0;
const MAX_RETRIES = 5;
const BASE_DELAY = 1000;
const HEARTBEAT_INTERVAL = 20000;

// 소켓 연결
export const connect = () => {
    if (client?.connected) {
        console.log("✅ 이미 WebSocket 연결됨");
        return Promise.resolve(client);
    }
    
    if (isConnecting && connectionPromise) {
        console.log("⏳ WebSocket 연결 시도 중...");
        return connectionPromise;
    }

    console.log("🔄 WebSocket 연결 시작");
    isConnecting = true;

    connectionPromise = new Promise((resolve, reject) => {
        try {
            // SockJS 팩토리 함수 생성 (자동 재연결을 위해)
            const socketFactory = () => new SockJS(import.meta.env.VITE_APP_BASE_API_BASE_URL + '/ws');
            client = Stomp.over(socketFactory);

            // 디버그 로그 설정
            client.debug = (msg) => {
                console.log("[STOMP]", msg);
            };

            // 하트비트 설정
            client.heartbeatOutgoing = HEARTBEAT_INTERVAL;
            client.heartbeatIncoming = HEARTBEAT_INTERVAL;

            // 인증 헤더 준비
            const { accessToken } = useAuthStore.getState();
            const connectHeaders = {};
            if (accessToken) {
                connectHeaders.Authorization = `Bearer ${accessToken}`;
                console.log("🔑 인증 토큰 포함하여 연결");
            }

            // 연결 시도
            client.connect(
                connectHeaders,
                (frame) => {
                    console.log("✅ WebSocket 연결 성공:", frame);
                    isConnecting = false;
                    retryCount = 0;
                    
                    // 기존 구독들 재구독
                    resubscribeAll();
                    
                    resolve(client);
                },
                (error) => {
                    console.error("❌ WebSocket 연결 실패:", error);
                    handleConnectionError(error, reject);
                }
            );

            // WebSocket 이벤트 핸들러
            client.onWebSocketError = (event) => {
                console.error("🔴 WebSocket 오류:", event);
            };

            client.onWebSocketClose = (event) => {
                console.warn("🔌 WebSocket 연결 종료:", event.code, event.reason);
                
                // 정상 종료가 아닌 경우 재연결 시도
                if (event.code !== 1000) {
                    scheduleReconnect();
                }
            };

            client.onStompError = (frame) => {
                console.error("🔴 STOMP 오류:", frame);
                handleConnectionError(new Error(frame.headers?.message || "STOMP Error"), reject);
            };

        } catch (error) {
            console.error("❌ WebSocket 초기화 실패:", error);
            handleConnectionError(error, reject);
        }
    });

    return connectionPromise;
};

// 연결 오류 처리
const handleConnectionError = (error, reject) => {
    isConnecting = false;
    client = null;
    connectionPromise = null;
    
    // 인증 오류인지 확인
    const errorMsg = String(error?.message || error).toLowerCase();
    if (errorMsg.includes('unauthorized') || errorMsg.includes('401') || errorMsg.includes('403')) {
        console.error("🚫 인증 오류 - 재연결 중단");
        reject(new Error("인증 실패"));
        return;
    }
    
    scheduleReconnect();
    reject(error);
};

// 재연결 스케줄링
const scheduleReconnect = () => {
    if (retryCount >= MAX_RETRIES) {
        console.error("🚨 최대 재연결 시도 횟수 초과");
        return;
    }
    
    retryCount++;
    const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 30000);
    console.log(`⏳ ${delay / 1000}초 후 재연결 시도 (${retryCount}/${MAX_RETRIES})`);
    
    setTimeout(() => {
        if (!client?.connected) {
            connect().catch(console.error);
        }
    }, delay);
};

// 기존 구독들 재구독
const resubscribeAll = () => {
    if (subscriptionCallbacks.size === 0) return;
    
    console.log("🔄 기존 구독들 재구독 중...");
    
    // 기존 구독 객체들 정리
    subscriptions.clear();
    
    // 저장된 콜백으로 재구독
    subscriptionCallbacks.forEach((callback, stockId) => {
        try {
            const subscription = client.subscribe(`/topic/stock${stockId}/update`, (message) => {
                try {
                    console.log(`📈 주식 ${stockId} 데이터 수신:`, message.body);
                    callback(stockId, message.body);
                } catch (error) {
                    console.error(`주식 ${stockId} 처리 오류:`, error);
                }
            });
            
            subscriptions.set(stockId, subscription);
            console.log(`📩 주식 ${stockId} 재구독 완료`);
        } catch (error) {
            console.error(`주식 ${stockId} 재구독 실패:`, error);
        }
    });
};

// 연결 해제
export const disconnect = () => {
    console.log("🔌 WebSocket 연결 해제 시작");
    
    unsubscribeAll();
    
    if (client?.connected) {
        try {
            client.disconnect(() => {
                console.log("✅ WebSocket 연결 해제 완료");
            });
        } catch (error) {
            console.error("연결 해제 오류:", error);
        }
    }
    
    client = null;
    isConnecting = false;
    connectionPromise = null;
    retryCount = 0;
    subscriptionCallbacks.clear();
};

// 주식 데이터 구독
export const subscribeToStock = async (stockId, onStockUpdate) => {
    console.log(`📩 주식 ${stockId} 구독 요청`);
    
    // 콜백 저장 (재구독용)
    subscriptionCallbacks.set(stockId, onStockUpdate);
    
    // 이미 구독 중인지 확인
    if (isStockSubscribed(stockId)) {
        console.log(`✅ 주식 ${stockId} 이미 구독 중`);
        return subscriptions.get(stockId);
    }

    try {
        await connect();
        
        if (!client?.connected) {
            throw new Error("WebSocket 연결 실패");
        }

        const subscription = client.subscribe(`/topic/stock${stockId}/update`, (message) => {
            try {
                console.log(`📈 주식 ${stockId} 데이터 수신:`, message.body);
                onStockUpdate(stockId, message.body);
            } catch (error) {
                console.error(`주식 ${stockId} 처리 오류:`, error);
            }
        });

        subscriptions.set(stockId, subscription);
        console.log(`✅ 주식 ${stockId} 구독 완료`);
        
        return subscription;

    } catch (error) {
        console.error(`❌ 주식 ${stockId} 구독 실패:`, error);
        // 실패 시 콜백 제거
        subscriptionCallbacks.delete(stockId);
        throw error;
    }
};

// 특정 주식 구독 해제
export const unsubscribeStock = (stockId) => {
    console.log(`🔌 주식 ${stockId} 구독 해제`);
    
    const subscription = subscriptions.get(stockId);
    if (subscription) {
        try {
            subscription.unsubscribe();
            subscriptions.delete(stockId);
            subscriptionCallbacks.delete(stockId);
            console.log(`✅ 주식 ${stockId} 구독 해제 완료`);
        } catch (error) {
            console.error(`❌ 주식 ${stockId} 구독 해제 실패:`, error);
        }
    }
};

// 모든 구독 해제
export const unsubscribeAll = () => {
    console.log("🔌 모든 구독 해제");
    
    subscriptions.forEach((subscription, stockId) => {
        try {
            subscription.unsubscribe();
        } catch (error) {
            console.error(`주식 ${stockId} 구독 해제 실패:`, error);
        }
    });
    
    subscriptions.clear();
    // 재구독용 콜백은 유지 (연결이 끊어졌다가 다시 연결될 때 자동 재구독)
};

// 구독 상태 확인
export const isStockSubscribed = (stockId) => subscriptions.has(stockId);

// 구독 목록
export const getSubscribedStocks = () => Array.from(subscriptions.keys());

// 연결 상태 확인
export const isConnected = () => client?.connected || false;

// 연결 대기 함수
export const waitForConnection = async (timeout = 10000) => {
    if (client?.connected) {
        return true;
    }

    try {
        const connectPromise = connect();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), timeout)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        return client?.connected || false;
    } catch (error) {
        console.error("연결 대기 실패:", error);
        return false;
    }
};

// 브라우저 가시성 변경 시 처리
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log("📱 브라우저 숨김 - 재연결 일시정지");
        } else {
            console.log("📱 브라우저 활성화 - 연결 상태 확인");
            if (!isConnected() && !isConnecting) {
                connect().catch(console.error);
            }
        }
    });
}