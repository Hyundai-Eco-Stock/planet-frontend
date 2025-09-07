// wsClient.js (Pure JS)
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import useAuthStore from "@/store/authStore";

// ===== 설정 =====
const WS_PATH = "/ws";
const BASE_URL = import.meta.env.VITE_APP_BASE_API_BASE_URL; // e.g. https://api.greendealshop.store
const MAX_RETRIES = 6;
const BASE_DELAY = 1000;
const MAX_DELAY = 15000;
const HEARTBEAT_OUT = 20000;
const HEARTBEAT_IN = 20000;
const PAUSE_WHEN_HIDDEN = true;

let client = null;
let isConnecting = false;
let connectionPromise = null;
let retry = 0;
let reconnectTimer = null;
let hardStop = false; // auth/policy error 시 재시도 중단

// 재구독을 위해 "stockId -> subscription" / "stockId -> callback" 저장
const subscriptionObjs = new Map();
const subscriptionCallbacks = new Map();

function clearReconnectTimer() {
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function shouldPause() {
  return PAUSE_WHEN_HIDDEN && typeof document !== "undefined" && document.hidden;
}

function computeDelay() {
  const jitter = Math.random() * 300;
  return Math.min(BASE_DELAY * Math.pow(2, retry) + jitter, MAX_DELAY);
}

function stopAll() {
  hardStop = true;
  clearReconnectTimer();
  isConnecting = false;
  connectionPromise = null;
  retry = 0;
}

function hasAuthLikeError(body) {
  if (!body) return false;
  const b = String(body).toLowerCase();
  return (
    b.includes("unauthorized") ||
    b.includes("forbidden") ||
    b.includes("401") ||
    b.includes("403") ||
    b.includes("token") ||
    b.includes("expired")
  );
}

function isAuthErrorLike(err) {
  const msg = String(err?.message || err).toLowerCase();
  return (
    msg.includes("unauthorized") ||
    msg.includes("forbidden") ||
    msg.includes("401") ||
    msg.includes("403")
  );
}

function scheduleReconnect(reject) {
  isConnecting = false;
  connectionPromise = null;

  if (hardStop || shouldPause()) return;
  if (retry >= MAX_RETRIES) {
    reject(new Error("Max WS reconnect attempts exceeded"));
    return;
  }
  retry += 1;
  const delay = computeDelay();
  clearReconnectTimer();
  reconnectTimer = window.setTimeout(() => {
    if (!hardStop) connect().catch(() => {});
  }, delay);
}

function resubscribeAll() {
  const entries = Array.from(subscriptionCallbacks.entries());
  entries.forEach(([stockId, cb]) => {
    try {
      const old = subscriptionObjs.get(stockId);
      if (old) old.unsubscribe();
    } catch (_) {}
    try {
      const sub = client.subscribe(`/topic/stock${stockId}/update`, (msg) => {
        try { cb(stockId, msg.body); } catch (e) {
          console.error(`stock ${stockId} handler error:`, e);
        }
      });
      subscriptionObjs.set(stockId, sub);
    } catch (e) {
      console.error(`resubscribe ${stockId} failed:`, e);
    }
  });
}

// ===== 공개 API =====

// 소켓 연결
export const connect = () => {
  if (client?.connected) return Promise.resolve(client);
  if (isConnecting && connectionPromise) return connectionPromise;
  if (hardStop) return Promise.reject(new Error("WS reconnect disabled (auth/policy error)"));

  isConnecting = true;

  connectionPromise = new Promise((resolve, reject) => {
    const { accessToken } = useAuthStore.getState();

    const socketFactory = () => new SockJS(`${BASE_URL}${WS_PATH}`);
    const c = Stomp.over(socketFactory);
    client = c;

    // 로그 스팸 방지
    c.debug = () => {};

    // 하트비트
    c.heartbeatOutgoing = HEARTBEAT_OUT;
    c.heartbeatIncoming = HEARTBEAT_IN;

    const connectHeaders = {};
    if (accessToken) {
      connectHeaders.Authorization = `Bearer ${accessToken}`;
    }

    c.onConnect = () => {
      isConnecting = false;
      retry = 0;
      clearReconnectTimer();
      hardStop = false;
      resubscribeAll();
      resolve(c);
    };

    c.onStompError = (frame) => {
      console.error("STOMP error:", frame?.headers?.message, frame?.body);
      if (hasAuthLikeError(frame?.body)) {
        stopAll();
        reject(new Error("Authorization failed at STOMP level"));
        disconnect();
      } else {
        scheduleReconnect(reject);
      }
    };

    c.onWebSocketError = (evt) => {
      // 네트워크/프록시 에러 로그(참고용)
      console.error("WS socket error:", evt?.message || evt);
    };

    c.onWebSocketClose = (evt) => {
      // 정책 위반(1008) / 커스텀 코드(4001/4003) → 재시도 중단
      if ([1008, 4001, 4003].includes(evt.code)) {
        console.error("WS closed with policy/auth error:", evt.code, evt.reason);
        stopAll();
        reject(new Error(`WS closed: ${evt.code} ${evt.reason}`));
        disconnect();
        return;
      }
      scheduleReconnect(reject);
    };

    try {
      // ✅ onConnect 자리에 "빈 함수"를 반드시 넣어 성공 프레임이 onError로 안 떨어지게 함
      c.connect(
        connectHeaders,
        () => {}, // onConnect (실제 처리는 c.onConnect에서)
        (error) => {
          // old signature용 에러 콜백
          console.error("connect error:", error);
          if (isAuthErrorLike(error)) {
            stopAll();
            reject(new Error("Authorization failed at connect"));
            disconnect();
          } else {
            scheduleReconnect(reject);
          }
        }
      );
    } catch (err) {
      console.error("WS init error:", err);
      scheduleReconnect(reject);
    }
  });

  return connectionPromise;
};

// 연결 해제
export const disconnect = () => {
  unsubscribeAll();
  clearReconnectTimer();
  try {
    if (client?.deactivate) client.deactivate();
    else if (client?.disconnect) client.disconnect();
  } catch (_) {}
  client = null;
  isConnecting = false;
  connectionPromise = null;
};

// 주식 데이터 구독
export const subscribeToStock = async (stockId, onStockUpdate) => {
  // 콜백 저장(재구독용)
  subscriptionCallbacks.set(stockId, onStockUpdate);

  // 이미 구독 중이면 반환
  if (subscriptionObjs.has(stockId)) return subscriptionObjs.get(stockId);

  try {
    await connect();
    if (!client?.connected) throw new Error("WebSocket not connected");

    const sub = client.subscribe(`/topic/stock${stockId}/update`, (msg) => {
      try {
        onStockUpdate(stockId, msg.body);
      } catch (e) {
        console.error(`stock ${stockId} handler error:`, e);
      }
    });

    subscriptionObjs.set(stockId, sub);
    return sub;
  } catch (err) {
    console.error(`subscribe ${stockId} failed:`, err);
    return null;
  }
};

// 특정 주식 구독 해제
export const unsubscribeStock = (stockId) => {
  const sub = subscriptionObjs.get(stockId);
  if (sub) {
    try { sub.unsubscribe(); } catch (_) {}
    subscriptionObjs.delete(stockId);
  }
  // 콜백까지 지우고 싶으면 아래 라인 주석 해제
  // subscriptionCallbacks.delete(stockId);
};

// 모든 구독 해제
export const unsubscribeAll = () => {
  subscriptionObjs.forEach((sub) => {
    try { sub.unsubscribe(); } catch (_) {}
  });
  subscriptionObjs.clear();
};

// 구독 상태 확인
export const isStockSubscribed = (stockId) => subscriptionObjs.has(stockId);

// 구독 목록
export const getSubscribedStocks = () => Array.from(subscriptionObjs.keys());

// 연결 상태 확인
export const isConnected = () => !!client?.connected;

// 연결 대기
export const waitForConnection = async () => {
  if (isConnected()) return true;
  try {
    await connect();
    return true;
  } catch (_) {
    return false;
  }
};

// 탭 비활성 시 재시도 일시정지/복귀
if (PAUSE_WHEN_HIDDEN && typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearReconnectTimer();
    } else {
      if (!isConnected() && !isConnecting && !hardStop) {
        connect().catch(() => {});
      }
    }
  });
}
