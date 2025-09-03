import React, { useEffect, useMemo, useState } from "react";
import { fetchMyOrders } from "@/api/member/member.api";
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
        paymentStatus: r.paymentStatus ?? r.payment_status,
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
      salePercent: r.salePercent ?? r.sale_percent,
      finalProductPrice: r.finalProductPrice ?? r.final_product_price,
      quantity: r.quantity,
      discountPrice: r.discountPrice,
      ecoDealStatus: r.ecoDealStatus ?? r.eco_deal_status ?? (r.isEcoDeal ? "Y" : "N"),
      cancelStatus: r.cancelStatus ?? r.cancel_status ?? r.cancel,
    });
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** chips */
const Chip = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}>{children}</span>
);

const StatusChip = ({ status }) => {
  const raw = String(status || "").toUpperCase();
  // tolerate common typos
  const norm = {
    PAID: "PAID",
    DONE: "PAID", // sometimes PAID/DONE are mixed in upstream
    ALL_CANCELLED: "ALL_CANCELLED",
    ALL_CANCELED: "ALL_CANCELLED",
    ALL_CANCLLED: "ALL_CANCELLED",
    PARTIAL_CANCELLED: "PARTIAL_CANCELLED",
    PARTIAL_CANCELED: "PARTIAL_CANCELLED",
    PARTIAL_CANCLLED: "PARTIAL_CANCELLED",
    PARTIOAL_CANCLED: "PARTIAL_CANCELLED",
  }[raw] || "PENDING";

  const labelMap = {
    PAID: "구매확정",
    ALL_CANCELLED: "전체취소됨",
    PARTIAL_CANCELLED: "부분취소됨",
    PENDING: "구매확정 대기중",
  };
  const colorMap = {
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ALL_CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
    PARTIAL_CANCELLED: "bg-amber-50 text-amber-700 border-amber-200",
    PENDING: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return <Chip className={colorMap[norm]}>{labelMap[norm]}</Chip>;
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

const ConfirmChip = () => (
  <Chip className="bg-emerald-50 text-emerald-700 border-emerald-200">구매확정</Chip>
);
const AllCancelChip = () => (
  <Chip className="bg-rose-50 text-rose-700 border-rose-200">전체 취소</Chip>
);

/** main */
export default function MyBuyHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [selectedByOrder, setSelectedByOrder] = useState({}); // { [orderHistoryId]: Set(orderProductId) }
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, items: [], reason: "" });

  const toggleSelect = (orderId, orderProductId, checked) => {
    setSelectedByOrder((prev) => {
      const set = new Set(prev[orderId] || []);
      if (checked) set.add(orderProductId);
      else set.delete(orderProductId);
      return { ...prev, [orderId]: set };
    });
  };

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
        const isPaymentDone = String(order.paymentStatus).toUpperCase() === "DONE";
        const isOrderDone = String(order.orderStatus).toUpperCase() === "DONE";
        const isAllCancelled = String(order.orderStatus).toUpperCase() === "ALL_CANCELLED";
        const isPartialCancelled = String(order.orderStatus).toUpperCase() === "PARTIAL_CANCELLED";
        const isConfirmed = isOrderDone && isPaymentDone; // 둘 다 DONE일 때만 구매확정
        // Actions: 결제 DONE이면서 주문이 아직 DONE이 아닐 때만 표시 (전체취소 제외)
        const showActionButtons = isPaymentDone && !isOrderDone && !isAllCancelled;
        // Header status chip 표시용 상태 계산
        const headerStatus = (() => {
          if (isAllCancelled) return "ALL_CANCELLED";
          if (isPartialCancelled) return "PARTIAL_CANCELLED";
          if (isConfirmed) return "PAID"; // StatusChip에서 "구매확정" 라벨로 표시됨
          return "PENDING";
        })();

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
                  <StatusChip status={headerStatus} />
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
              <StatusChip status={headerStatus} />
            </div>

            {/* items */}
            <ul className="px-2 pb-2 space-y-2">
              {order.items.map((it) => {
                const unitPrice = Number(
                  it.finalProductPrice != null
                    ? it.finalProductPrice
                    : (Number(it.price || 0) - Number(it.discountPrice || 0))
                );
                const lineTotal = unitPrice * Number(it.quantity || 1);
                const eco = it.ecoDealStatus === "Y";
                return (
                  <li
                    key={it.orderProductId}
                    onClick={() =>
                      navigate(
                        it.ecoDealStatus === "Y"
                          ? `/eco-deal/detail?productId=${it.productId}`
                          : `/shopping/detail?productId=${it.productId}`
                      )
                    }
                    className={`relative cursor-pointer rounded-xl border border-gray-100 bg-white/70 hover:bg-white transition-colors shadow-sm p-2 sm:p-3 flex items-center gap-3 ${isAllCancelled ? "opacity-60" : ""} ${isPartialCancelled && it.cancelStatus === "Y" ? "opacity-60" : ""} ${isConfirmed ? "ring-2 ring-emerald-300 shadow-lg bg-gradient-to-r from-emerald-50/70 to-white" : ""}`}
                  >
                    {showActionButtons && !(isPartialCancelled && it.cancelStatus === "Y") && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-rose-600 mt-0.5"
                        checked={Boolean(selectedByOrder[order.orderHistoryId]?.has(it.orderProductId))}
                        onChange={(e) => toggleSelect(order.orderHistoryId, it.orderProductId, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
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
                    {isConfirmed && (
                      <div className="absolute right-2 top-2">
                        <Chip className="bg-emerald-600 text-white border-emerald-600">구매확정</Chip>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">
                        {it.productName || `상품 #${it.productId}`}
                      </div>
                      {isPartialCancelled && (
                        <div className="mt-1">
                          {it.cancelStatus === "Y" ? (
                            <Chip className="bg-rose-50 text-rose-700 border-rose-200">취소됨</Chip>
                          ) : (
                            <Chip className="bg-sky-50 text-sky-700 border-sky-200">유지</Chip>
                          )}
                        </div>
                      )}
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        수량 {it.quantity} · 단가 {currency(it.finalProductPrice ?? it.price)}
                        {Number(it.salePercent || 0) > 0 && (
                          <span className="ml-1 align-middle">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              -{Number(it.salePercent)}%
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="mt-1"><EcoChip eco={eco} /></div>
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap">{currency(lineTotal)}</div>
                  </li>
                );
              })}
            </ul>

            {/* cancellation action (only for PAID) */}
            {showActionButtons && (
              <div className="px-4 pb-3 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-500"></div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const selected = Array.from(selectedByOrder[order.orderHistoryId] || []);
                      setCancelModal({ open: true, orderId: order.orderHistoryId, items: selected, reason: "" });
                    }}
                    disabled={!(selectedByOrder[order.orderHistoryId] && selectedByOrder[order.orderHistoryId].size > 0)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors
                      ${selectedByOrder[order.orderHistoryId] && selectedByOrder[order.orderHistoryId].size > 0
                        ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"}`}
                  >
                    구매취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const selected = Array.from(selectedByOrder[order.orderHistoryId] || []);
                      const items = selected.join(",");
                      navigate(`/orders/confirm?orderHistoryId=${order.orderHistoryId}${items ? `&items=${items}` : ""}`);
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                  >
                    구매확정
                  </button>
                </div>
              </div>
            )}

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

      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-200">
            <div className="text-base font-semibold mb-1">정말 취소하시겠습니까?</div>
            <p className="text-[12px] text-gray-500 mb-3">취소 사유를 작성해 주세요.</p>
            <textarea
              className="w-full h-28 resize-none rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="예: 단순 변심, 상품 정보 오류 등"
              value={cancelModal.reason}
              onChange={(e) => setCancelModal((m) => ({ ...m, reason: e.target.value }))}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModal({ open: false, orderId: null, items: [], reason: "" })}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  // Placeholder: pass selection & reason. Adjust endpoint as needed.
                  const items = cancelModal.items.join(",");
                  const reason = encodeURIComponent(cancelModal.reason || "");
                  navigate(`/orders/cancel?orderHistoryId=${cancelModal.orderId}&items=${items}&reason=${reason}`);
                  setCancelModal({ open: false, orderId: null, items: [], reason: "" });
                }}
                disabled={cancelModal.items.length === 0}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors
                  ${cancelModal.items.length > 0
                    ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
                    : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"}`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
