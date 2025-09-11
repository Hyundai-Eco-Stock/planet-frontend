import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchMyEcostocks, fetchEcostockPrices } from "@/api/member/member.api";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const MyEcoStockPage = () => {
    const { setTitle } = useOutletContext();
    const [items, setItems] = useState([]);
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastSyncAt, setLastSyncAt] = useState(null);

    useEffect(() => {
        setTitle("내 에코스톡");
    }, [setTitle]);

    const loadEcoStockData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [stocks, priceList] = await Promise.all([
                fetchMyEcostocks(),
                fetchEcostockPrices()
            ]);
            setItems(Array.isArray(stocks) ? stocks : []);
            setPrices(Array.isArray(priceList) ? priceList : []);
            setLastSyncAt(new Date());
        } catch (e) {
            console.error("에코스톡 데이터 불러오기 실패", e);
            setError(e?.message || "에코스톡 데이터를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEcoStockData();
    }, []);

    // 가격 매핑
    const priceMap = useMemo(() => {
        const map = new Map();
        (prices || []).forEach((p) => {
            const id = p.ecoStockId ?? p.eco_stock_id;
            if (id != null) {
                map.set(id, Number(p.stockPrice ?? p.stock_price));
            }
        });
        return map;
    }, [prices]);

    // 보유 에코스톡 처리
    const enrichedStocks = useMemo(() => {
        return (items || [])
            .filter((it) => Number(it?.currentTotalQuantity || 0) > 0)
            .map((it) => {
                const qty = Number(it.currentTotalQuantity || 0);
                const amt = Number(it.currentTotalAmount || 0);
                const avg = qty > 0 ? amt / qty : 0;
                const cur = priceMap.has(it.ecoStockId) ? Number(priceMap.get(it.ecoStockId)) : null;
                const changePct = cur != null && avg > 0 ? ((cur - avg) / avg) * 100 : null;
                return { ...it, avgUnitPrice: avg, stockPrice: cur, changePercent: changePct };
            });
    }, [items, priceMap]);

    // 총 가치 계산 - 소숫점 제거
    const totalValue = Math.floor(enrichedStocks.reduce((sum, stock) => {
        const price = stock.stockPrice || 0;
        const quantity = stock.currentTotalQuantity || 0;
        return sum + (price * quantity);
    }, 0));

    return (
        <div className="min-h-screen bg-white relative">
            {/* 상단 헤더 배너 */}
            <div className="absolute top-0 left-0 right-0 -mx-4">
                <div className="bg-gradient-to-b from-blue-200/40 via-blue-100/20 to-transparent px-6 py-8 h-40">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">내 에코스톡</h1>
                        <p className="text-gray-600">보유 중인 에코스톡을 확인하세요</p>
                    </div>
                </div>
            </div>

            <main className="relative z-10 px-4 pb-20 pt-40">
                {/* 동기화 버튼 */}
                <div className="flex justify-center mb-4">
                    <button
                        type="button"
                        onClick={loadEcoStockData}
                        disabled={loading}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border border-blue-300/30 transition-all ${loading
                                ? 'bg-blue-100/20 text-blue-600/60'
                                : 'bg-blue-100/30 text-blue-700 hover:bg-blue-100/50 shadow-sm'
                            }`}
                    >
                        {loading ? '동기화 중…' : '시세 동기화'}
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* 총 가치 */}
                <div className="text-center mb-8">
                    <div className="text-gray-500 text-sm mb-1">에코스톡 총 가치</div>
                    <div className="text-4xl font-bold text-blue-600">
                        {totalValue.toLocaleString("ko-KR")} P
                    </div>
                    {lastSyncAt && (
                        <div className="text-gray-400 text-xs mt-2">
                            최근 동기화: {lastSyncAt.toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    )}
                </div>

                {/* 에코스톡 보유 현황 */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4 py-4">
                        <h2 className="text-lg font-bold text-gray-900">보유 현황</h2>
                        <span className="text-sm text-gray-500">{enrichedStocks.length}종목</span>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                                <div className="text-gray-500 text-sm">불러오는 중...</div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                            <div className="text-red-600 text-sm">{error}</div>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {enrichedStocks.length > 0 ? (
                                <div className="space-y-3">
                                    {enrichedStocks.map((stock) => (
                                        <EcoStockRow key={stock.memberStockInfoId} stock={stock} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">💎</span>
                                    </div>
                                    <div className="text-gray-500 mb-2">보유 중인 에코스톡이 없습니다</div>
                                    <div className="text-gray-400 text-sm">환경 활동을 통해 에코스톡을 적립해보세요</div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

const EcoStockRow = ({ stock }) => {
    const {
        ecoStockName,
        currentTotalQuantity,
        stockPrice,
        avgUnitPrice,
        changePercent,
    } = stock;

    const totalValue = Math.floor((stockPrice || 0) * (currentTotalQuantity || 0));
    const hasChange = typeof changePercent === 'number';
    const isPositive = changePercent > 0;
    const isNegative = changePercent < 0;

    // 에코스톡별 아이콘과 색상 매핑
    const getStockIcon = (name) => {
        if (name?.includes('텀블러') || name?.includes('컵')) return '🥤';
        if (name?.includes('종이백') || name?.includes('백')) return '🛍️';
        if (name?.includes('재활용') || name?.includes('리사이클')) return '♻️';
        if (name?.includes('나무') || name?.includes('식물')) return '🌳';
        if (name?.includes('태양') || name?.includes('태양광')) return '☀️';
        if (name?.includes('바다') || name?.includes('해양')) return '🌊';
        if (name?.includes('대기') || name?.includes('공기')) return '💨';
        return '🌱'; // 기본 아이콘
    };

    const getStockColor = (name) => {
        if (name?.includes('텀블러') || name?.includes('컵')) return 'blue';
        if (name?.includes('종이백') || name?.includes('백')) return 'amber';
        if (name?.includes('재활용') || name?.includes('리사이클')) return 'green';
        if (name?.includes('나무') || name?.includes('식물')) return 'emerald';
        if (name?.includes('태양') || name?.includes('태양광')) return 'orange';
        if (name?.includes('바다') || name?.includes('해양')) return 'cyan';
        if (name?.includes('대기') || name?.includes('공기')) return 'sky';
        return 'teal'; // 기본 색상
    };

    const stockIcon = getStockIcon(ecoStockName);
    const stockColor = getStockColor(ecoStockName);

    return (
        <div className={`bg-white border border-${stockColor}-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-3">
                {/* 아이콘 */}
                <div className={`w-12 h-12 bg-${stockColor}-100 rounded-full flex items-center justify-center`}>
                    <span className="text-xl">{stockIcon}</span>
                </div>

                {/* 종목 정보 */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-900">
                            {ecoStockName}
                        </div>
                        {hasChange && (
                            <div className={`text-xs px-2 py-1 rounded-full ${isPositive
                                    ? 'bg-red-100 text-red-600'
                                    : isNegative
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                {isPositive ? '▲' : isNegative ? '▼' : '—'} {Math.abs(changePercent).toFixed(2)}%
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">보유 수량</span>
                            <span className="font-semibold text-gray-900 pr-2">
                                {(currentTotalQuantity || 0).toLocaleString("ko-KR")}개
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">현재가</span>
                            <span className="font-semibold text-gray-900 pr-2">
                                {(stockPrice || 0).toLocaleString("ko-KR")}P
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">총 가치</span>
                            <span className={`font-bold text-lg text-${stockColor}-600 pr-2`}>
                                {totalValue.toLocaleString("ko-KR")}P
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyEcoStockPage;