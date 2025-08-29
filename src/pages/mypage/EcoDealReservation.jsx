import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyEcoDeals } from "@/api/order/order.api";

export default function EcoDealReservation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchMyEcoDeals(); // expected: array of items
        if (mounted) setData(Array.isArray(res) ? res : []);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const normalizeStatus = (s) => {
    const raw = String(s || "").toUpperCase();
    if (["PAID", "DONE"].includes(raw)) return "PAID";
    if (["ALL_CANCELLED", "ALL_CANCELED", "ALL_CANCLLED"].includes(raw)) return "ALL_CANCELLED";
    if (["PARTIAL_CANCELLED", "PARTIAL_CANCELED", "PARTIAL_CANCLLED", "PARTIOAL_CANCLED"].includes(raw)) return "PARTIAL_CANCELLED";
    return "PENDING";
  };
  const statusLabel = (norm) => ({
    PAID: "구매확정",
    ALL_CANCELLED: "전체취소됨",
    PARTIAL_CANCELLED: "부분취소됨",
    PENDING: "구매확정 대기중",
  })[norm] || "구매확정 대기중";

  const grouped = useMemo(() => {
    // group by orderNumber
    const map = new Map();
    for (const it of data) {
      const key = it.orderNumber ?? "UNKNOWN";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    return Array.from(map.entries()).map(([orderNumber, items]) => {
      // representative (same across items)
      const head = items[0] ?? {};
      const totals = {
        originPrice: head.originPrice ?? items.reduce((s, x) => s + (x.price ?? 0) * (x.quantity ?? 1), 0),
        usedPoint: head.usedPoint ?? 0,
        donationPrice: head.donationPrice ?? 0,
        finalPayPrice: head.finalPayPrice ?? head.originPrice ?? 0,
      };
      return {
        orderNumber,
        orderStatus: normalizeStatus(head.orderStatus),
        createdAt: head.createdAt,
        orderType: head.orderType,
        ecoDealQrUrl: head.ecoDealQrUrl,
        totals,
        items,
      };
    });
  }, [data]);

  const fmtCurrency = (n) =>
    typeof n === "number"
      ? n.toLocaleString("ko-KR")
      : Number(n ?? 0).toLocaleString("ko-KR");

  if (loading) {
    return (
      <div className="max-w-[960px] mx-auto my-8 px-4">
        <h1 className="text-lg font-bold mb-4">에코딜 주문내역</h1>
        <div className="border border-dashed rounded-lg p-4 text-gray-500">불러오는 중…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-[960px] mx-auto my-8 px-4">
        <h1 className="text-lg font-bold mb-4">에코딜 주문내역</h1>
        <div className="border border-rose-300 bg-rose-100 text-rose-800 rounded-lg p-4">주문내역을 불러오지 못했습니다.</div>
      </div>
    );
  }
  if (!grouped.length) {
    return (
      <div className="max-w-[960px] mx-auto my-8 px-4">
        <h1 className="text-lg font-bold mb-4">에코딜 주문내역</h1>
        <div className="border border-gray-300 bg-gray-50 text-gray-500 rounded-lg p-4">주문내역이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto my-8 px-4">
      <h1 className="text-lg font-bold mb-4">에코딜 주문내역</h1>

      <div className="grid gap-4">
        {grouped.map((order) => (
          <section key={order.orderNumber} className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <header className="flex justify-between items-center px-3 py-2 border-b border-gray-100 bg-gray-50">
              <div className="grid gap-1">
                <div className="font-bold">주문번호 {order.orderNumber}</div>
                <div className="text-gray-500 flex gap-2 items-center text-xs">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${
                    order.orderStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    order.orderStatus === "ALL_CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-200" :
                    order.orderStatus === "PARTIAL_CANCELLED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-gray-50 text-gray-700 border-gray-200"
                  }`}>
                    {statusLabel(order.orderStatus)}
                  </span>
                  <span>{order.createdAt}</span>
                </div>
              </div>
              <div>
                {order.ecoDealQrUrl ? (
                  <a href={order.ecoDealQrUrl} target="_blank" rel="noreferrer" className="inline-block px-2 py-1 border border-gray-900 rounded-md text-xs text-gray-900 no-underline">
                    QR 보기
                  </a>
                ) : (
                  <span className="inline-block px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-500 bg-gray-100">
                    QR 미발급
                  </span>
                )}
              </div>
            </header>

            <ul className="list-none m-0 p-0">
              {order.items.map((p) => (
                <li
                  key={`${order.orderNumber}-${p.productId}`}
                  className="flex gap-3 p-2 border-b border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/eco-deal/detail?productId=${p.productId}`)}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.productName}
                    loading="lazy"
                    className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div className="grid gap-1 flex-1">
                    <div className={`font-semibold ${p.cancelStatus === "Y" ? "line-through text-gray-400" : ""}`}>
                      {p.productName}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-gray-500 text-xs flex gap-2 items-center">
                        <span className="text-gray-700">{p.brandName}</span>
                        <span className="text-gray-300">·</span>
                        <span>{p.categoryName}</span>
                      </div>
                      <div className="font-bold text-sm">{fmtCurrency(p.price)}원 <span className="text-gray-400 font-normal ml-1">× {p.quantity}</span></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="p-2 grid gap-1 bg-white">
              <div className="flex justify-between items-center text-xs"><span>상품합계</span><strong>{fmtCurrency(order.totals.originPrice)}원</strong></div>
              <div className="flex justify-between items-center text-xs"><span>포인트</span><strong>-{fmtCurrency(order.totals.usedPoint)}원</strong></div>
              <div className="flex justify-between items-center text-xs"><span>기부금</span><strong>-{fmtCurrency(order.totals.donationPrice)}원</strong></div>
              <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-300 pt-1 mt-0.5"><span>최종</span><strong>{fmtCurrency(order.totals.finalPayPrice)}원</strong></div>
            </footer>
          </section>
        ))}
      </div>
    </div>
  );
}
