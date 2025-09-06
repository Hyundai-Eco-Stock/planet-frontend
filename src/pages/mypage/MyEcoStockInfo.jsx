import { useEffect, useMemo, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { fetchMyEcostocks, fetchEcostockPrices } from "@/api/member/member.api";
 

const MyEcoStockInfo = () => {
  const [items, setItems] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const loadAll = async () => {
    let canceled = false;
    setLoading(true);
    setError(null);
    try {
      const [stocks, priceList] = await Promise.all([fetchMyEcostocks(), fetchEcostockPrices()]);
      if (canceled) return;
      setItems(Array.isArray(stocks) ? stocks : []);
      setPrices(Array.isArray(priceList) ? priceList : []);
      setLastSyncAt(new Date());
    } catch (e) {
      if (canceled) return;
      console.error("내 에코스톡/가격 조회 실패", e);
      setError(e?.message || "내 에코스톡을 불러오지 못했어요.");
      setItems([]);
      setPrices([]);
    } finally {
      if (canceled) return;
      setLoading(false);
    }
    return () => { canceled = true };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadAll();
    })();
    return () => { mounted = false; };
  }, []);

  const priceMap = useMemo(() => {
    const map = new Map();
    (prices || []).forEach((p) => {
      const id = p.ecoStockId ?? p.eco_stock_id;
      if (id == null) return;
      map.set(id, Number(p.stockPrice ?? p.stock_price));
    });
    return map;
  }, [prices]);

  const enriched = useMemo(() => {
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

  const summary = useMemo(() => {
    const totalQty = items.reduce((s, v) => s + (v.currentTotalQuantity || 0), 0);
    const totalAmt = items.reduce((s, v) => s + (v.currentTotalAmount || 0), 0);
    return { totalQty, totalAmt };
  }, [items]);

  return (
    <div className="p-4 md:p-6">
      {/* Header with Sync */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-extrabold tracking-tight">내 에코스톡</h2>
        <button
          type="button"
          onClick={loadAll}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors ${loading ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'}`}
          aria-busy={loading}
        >
          {loading ? '동기화 중…' : '동기화'}
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>
      {lastSyncAt && (
        <div className="mb-3 text-[11px] text-gray-500">최근 동기화: {lastSyncAt.toLocaleString('ko-KR')}</div>
      )}
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard label="총 포인트" value={`${formatNumber(items.point)}`} suffix="P" color="amber" />
      </div>

      {/* List */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="col-span-full text-gray-500">불러오는 중…</div>}
        {!loading && error && <div className="col-span-full text-rose-600">{error}</div>}
        {!loading && !error && enriched.map((it) => (
          <EcoCard key={it.memberStockInfoId} data={it} />
        ))}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, suffix, color = "indigo" }) => {
  const colorMap = {
    indigo: {
      ring: "ring-indigo-100",
      bg: "from-indigo-50 to-white",
      text: "text-indigo-700",
      dot: "bg-indigo-500",
    },
    emerald: {
      ring: "ring-emerald-100",
      bg: "from-emerald-50 to-white",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    amber: {
      ring: "ring-amber-100",
      bg: "from-amber-50 to-white",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
  }[color] || colorMap.indigo;

  return (
    <div className={`rounded-2xl border border-gray-200 ring-1 ${colorMap.ring} bg-gradient-to-b ${colorMap.bg} p-4`}> 
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{label}</div>
        <span className={`w-2.5 h-2.5 rounded-full ${colorMap.dot}`} />
      </div>
      <div className="mt-2 text-xl font-extrabold tracking-tight">
        {value}
        <span className="ml-1 text-xs text-gray-500">{suffix}</span>
      </div>
    </div>
  );
};

const EcoCard = ({ data }) => {
  const {
    ecoStockName,
    currentTotalQuantity,
    currentTotalAmount,
    point,
    stockPrice,
    avgUnitPrice,
    changePercent,
  } = data || {};

  return (
    <article
      role="article"
      aria-label={ecoStockName}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <h3 className="text-sm font-bold tracking-tight">{ecoStockName}</h3>
          </div>
          <div className="text-right">
            {typeof changePercent === 'number' && <ChangeBadge value={changePercent} />}
          </div>
        </div>

        {/* Body */}
        <div className="mt-3 grid gap-2">
          <KV label="평균 단가" value={`${avgUnitPrice ? formatNumber(Number(avgUnitPrice.toFixed(0))) : "-"} P`} />
          <KV label="현재가" value={`${stockPrice != null ? formatNumber(stockPrice) : "-"} P`} />
          <div className="h-px bg-gray-100 my-1" />
          <KV label="보유 수량" value={`${formatNumber(currentTotalQuantity)} 개`} />
          <KV label="평가 금액" value={`${formatNumber(currentTotalAmount)} 원`} />
        </div>
      </div>
    </article>
  );
};

const KV = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

function formatNumber(n) {
  const num = Number(n || 0);
  return num.toLocaleString("ko-KR");
}

const ChangeBadge = ({ value }) => {
  const v = Number(value || 0);
  const up = v > 0;
  const down = v < 0;
  const base = "inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold";
  const cls = up
    ? `${base} bg-rose-50 text-rose-700 border border-rose-200`
    : down
    ? `${base} bg-blue-50 text-blue-700 border border-blue-200`
    : `${base} bg-gray-50 text-gray-600 border border-gray-200`;
  return (
    <span className={cls}>
      <span aria-hidden>{up ? "▲" : down ? "▼" : "—"}</span>
      <span>{`${up ? "+" : ""}${Math.abs(v).toFixed(2)}%`}</span>
    </span>
  );
};

export default MyEcoStockInfo;
