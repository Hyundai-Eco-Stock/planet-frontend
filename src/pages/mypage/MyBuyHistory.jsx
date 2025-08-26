import React, { useEffect, useMemo, useState } from "react";
import { fetchMyOrders } from "@/api/order/order.api";
import { useNavigate } from "react-router-dom";

/** utils */
const currency = (v) => (v == null ? "-" : `${Number(v).toLocaleString("ko-KR")}원`);
const formatDate = (s) => {
  try {
    const d = new Date(String(s).replace(" ", "T"));
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_) {
    return s;
  }
};

/** grouping */
function groupOrders(rows) {
  const map = new Map();
  (rows || []).forEach((r) => {
    const key = r.orderHistoryId ?? r.order_history_id;
    if (key == null) return;
    const eco = r.ecoDealStatus === "Y" || r.eco_deal_status === "Y" || r.isEcoDeal === true;
    if (!map.has(key)) {
      map.set(key, {
        orderHistoryId: key,
        orderNumber: r.orderNumber,
        orderStatus: r.orderStatus,
        createdAt: r.createdAt,
        originPrice: r.originPrice,
        usedPoint: r.usedPoint,
        donationPrice: r.donationPrice,
        finalPayPrice: r.finalPayPrice,
        orderType: r.orderType,
        ecoAny: eco,
        items: [],
      });
    }
    const g = map.get(key);
    g.ecoAny = g.ecoAny || eco;
    g.items.push({
      orderProductId: r.orderProductId,
      productId: r.productId,
      productName: r.productName || r.name || `상품 #${r.productId}`,
      imageUrl: r.productImageUrl || r.imageUrl || r.product_image_url || "",
      price: r.price,
      quantity: r.quantity,
      discountPrice: r.discountPrice,
      ecoDealStatus: r.ecoDealStatus ?? r.eco_deal_status ?? (r.isEcoDeal ? "Y" : "N"),
    });
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** chips */
const Chip = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}>{children}</span>
);

const StatusChip = ({ status }) => {
  const map = {
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const cls = map[status] || "bg-gray-50 text-gray-700 border-gray-200";
  return <Chip className={cls}>{status}</Chip>;
};

const TypeChip = ({ type }) => (
  <Chip className={type === "PICKUP" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}>
    {type === "PICKUP" ? "픽업" : "배송"}
  </Chip>
);

const EcoChip = ({ eco }) => (
  eco ? (
    <Chip className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2c-4 0-7 3-7 7 0 2 1 3.7 2.5 4.8C6.6 15 6 16 6 17c0 2.2 1.8 4 4 4h1v1h2v-1h1c2.2 0 4-1.8 4-4 0-1-.6-2-1.5-3.2C18 12.7 19 11 19 9c0-4-3-7-7-7z" />
        <rect x="11" y="18" width="2" height="4" />
      </svg>
      에코딜
    </Chip>
  ) : (
    <Chip className="bg-gray-50 text-gray-600 border-gray-200">일반</Chip>
  )
);

/** main */
export default function MyBuyHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchMyOrders()
      .then((res) => setRows(Array.isArray(res) ? res : []))
      .catch((e) => setError(e?.message || "주문 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => groupOrders(rows), [rows]);

  if (loading) return <div className="p-6 text-sm text-gray-500">로딩 중…</div>;
  if (error) return <div className="p-6 text-sm text-rose-600">{error}</div>;
  if (!groups.length) return <div className="p-6 text-sm text-gray-500">구매 내역이 없습니다.</div>;

  return (
    <main className="p-4 max-w-screen-md mx-auto space-y-4">
      {groups.map((order) => {
        return (
          <section
            key={order.orderHistoryId}
            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* top ribbon */}
            <div className={`absolute inset-x-0 top-0 h-1 ${order.ecoAny ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-gray-200 to-gray-300"}`} />

            {/* header */}
            <header className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">        
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight truncate">주문번호 {order.orderNumber}</div>
                  <div className="text-[11px] text-gray-500">{formatDate(order.createdAt)}</div>
                </div>
                <div className="hidden sm:flex items-center gap-1 ml-2">
                  <StatusChip status={order.orderStatus} />
                  <TypeChip type={order.orderType} />
                  <EcoChip eco={order.ecoAny} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-gray-500">결제금액</div>
                  <div className="text-base font-extrabold">{currency(order.finalPayPrice)}</div>
                </div>
              </div>
            </header>

            {/* chips (mobile) */}
            <div className="px-4 pb-3 sm:hidden flex items-center gap-1">
              <StatusChip status={order.orderStatus} />
              <TypeChip type={order.orderType} />
              <EcoChip eco={order.ecoAny} />
            </div>

            {/* items */}
            <ul className="px-2 pb-2 space-y-2">
              {order.items.map((it) => {
                const lineTotal = (Number(it.price || 0) - Number(it.discountPrice || 0)) * Number(it.quantity || 1);
                const eco = it.ecoDealStatus === "Y";
                return (
                  <li
                    key={it.orderProductId}
                    onClick={() => navigate(`/shopping/detail?productId=${it.productId}`)}
                    className="cursor-pointer rounded-xl border border-gray-100 bg-white/70 hover:bg-white transition-colors shadow-sm p-2 sm:p-3 flex items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-none ring-1 ring-gray-100 bg-gray-50 relative">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.productName || `상품 #${it.productId}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full grid place-items-center text-xs ${eco ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'}`}>
                          {eco ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                              <path d="M12 2c-4 0-7 3-7 7 0 2 1 3.7 2.5 4.8C6.6 15 6 16 6 17c0 2.2 1.8 4 4 4h1v1h2v-1h1c2.2 0 4-1.8 4-4 0-1-.6-2-1.5-3.2C18 12.7 19 11 19 9c0-4-3-7-7-7z" />
                              <rect x="11" y="18" width="2" height="4" />
                            </svg>
                          ) : (
                            <span>IMG</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">
                        {it.productName || `상품 #${it.productId}`}
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-500">수량 {it.quantity} · 단가 {currency(it.price)}</div>
                      <div className="mt-1"><EcoChip eco={eco} /></div>
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap">{currency(lineTotal)}</div>
                  </li>
                );
              })}
            </ul>

            {/* footer */}
            <footer className="px-4 pb-4">
              <div className="mt-1 rounded-xl bg-gray-50/80 ring-1 ring-gray-100 p-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                <div className="text-gray-500">상품금액</div>
                <div className="text-right font-medium">{currency(order.originPrice)}</div>
                <div className="text-gray-500">포인트 사용</div>
                <div className="text-right font-medium">-{currency(order.usedPoint)}</div>
                <div className="text-gray-500">기부</div>
                <div className="text-right font-medium">{currency(order.donationPrice)}</div>
                <div className="col-span-2 border-t border-gray-200 mt-2 pt-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">결제금액</div>
                  <div className="text-base font-extrabold">{currency(order.finalPayPrice)}</div>
                </div>
              </div>
            </footer>
          </section>
        );
      })}
    </main>
  );
}