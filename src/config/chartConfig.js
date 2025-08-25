// chartConfig.js
import { CrosshairMode } from 'lightweight-charts';

// 색상 테마 정의
// 라이트 테마 정의
export const THEME = {
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    grid: '#f1f5f9',
    text: '#1e293b',
    textMuted: '#64748b',

    candle: {
        up: '#22c55e',
        down: '#ef4444',
        wick: '#64748b'
    },

    volume: {
        buy: '#22c55eb3',
        sell: '#ef4444b3',
        empty: '#94a3b8',
        same: '#f59e0b'  // 앰버/오렌지 계열
    },

    separator: '#cbd5e1'
};
// 레이아웃
export const LAYOUT = {
    margins: {
        top: 0.1,
        priceBottom: 0.3,
        volumeTop: 0.9,
        separatorTop: 0.798,
        separatorBottom: 0.198
    },

    priceScaleIds: {
        main: 'right',
        volume: 'volume',
        separator: 'separator'
    }
};

// 차트 설정
export const chartConfig = {
    base: (width, height) => ({
        width,
        height,
        layout: {
            backgroundColor: THEME.background,
            textColor: THEME.text
        },
        grid: {
            vertLines: { color: THEME.grid },
            horzLines: { color: THEME.grid }
        },
        crosshair: {
            mode: CrosshairMode.Normal
        },
        priceScale: {
            borderColor: THEME.border
        },
        timeScale: {
            borderColor: THEME.border,
            timeVisible: true,
            secondsVisible: false,
            timezone: 'Asia/Seoul'
        }
    }),

    candlestick: {
        upColor: THEME.candle.up,
        downColor: THEME.candle.down,
        borderDownColor: THEME.candle.down,
        borderUpColor: THEME.candle.up,
        wickDownColor: THEME.candle.wick,
        wickUpColor: THEME.candle.wick,
        priceScaleId: LAYOUT.priceScaleIds.main
    },

    volume: {
        color: THEME.surface,
        lineWidth: 2,
        priceFormat: { type: 'volume' },
        priceScaleId: LAYOUT.priceScaleIds.volume
    },

    separator: {
        color: THEME.separator,
        lineWidth: 1,
        priceScaleId: LAYOUT.priceScaleIds.separator,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: true
    }
};

export const priceScaleConfig = {
    main: {
        scaleMargins: {
            top: LAYOUT.margins.top,
            bottom: LAYOUT.margins.priceBottom
        }
    },

    volume: {
        scaleMargins: {
            top: LAYOUT.margins.volumeTop,
            bottom: 0
        }
    },

    separator: {
        scaleMargins: {
            top: LAYOUT.margins.separatorTop,
            bottom: LAYOUT.margins.separatorBottom
        },
        visible: false
    }
};