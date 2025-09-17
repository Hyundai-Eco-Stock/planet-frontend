import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchMyEcoDeals } from "@/api/member/member.api";

/** 주문번호 정리 함수 (요청 반영) */
const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return "N/A";
  let cleanNumber = String(orderNumber).replace(/^draft_/, "");
  if (cleanNumber.includes("_")) {
    const parts = cleanNumber.split("_");
    if (parts.length >= 2) {
      cleanNumber = parts[parts.length - 1].toUpperCase();
    }
  }
  return cleanNumber;
};

/**
 * EcoDealReservation – 취소 숨김 + 주문번호 포맷 적용 (.jsx)
 * - 취소 상태(전체/부분)는 목록/집계/필터에서 제외
 * - UI 리뉴얼, 기능 로직은 원본과 동일
 */
export default function EcoDealReservation() {
  const { setTitle } = useOutletContext();

  useEffect(() => {
    setTitle("푸드딜 주문내역");
  }, [setTitle]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // QR 모달
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrLoaded, setQrLoaded] = useState(false);

  const openQr = (url) => {
    setQrUrl(url || "");
    setQrLoaded(false);
    setQrOpen(Boolean(url));
  };

  const closeQr = () => setQrOpen(false);

  // 필터: 취소는 제거 → all | ready | completed
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchMyEcoDeals(); // row 배열 가정
        if (mounted) setData(Array.isArray(res) ? res : []);
      } catch (e) {
        if (mounted) setError("주문내역을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeQr();
    };
    if (qrOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [qrOpen]);

  /** 상태 정규화 (원본 유지) */
  const normalizeStatus = (s) => {
    const raw = String(s || "").toUpperCase();
    if (["COMPLETED"].includes(raw)) return "COMPLETED";
    if (["PAID", "DONE"].includes(raw)) return "PAID";
    if (["ALL_CANCELLED", "ALL_CANCELED", "ALL_CANCLLED"].includes(raw)) return "ALL_CANCELLED";
    if (
      [
        "PARTIAL_CANCELLED",
        "PARTIAL_CANCELED",
        "PARTIAL_CANCLLD",
        "PARTIAL_CANCLLED",
        "PARTIOAL_CANCLED",
      ].includes(raw)
    )
      return "PARTIAL_CANCELLED";
    return "PENDING";
  };

  /** 주문번호 기준 그룹핑 (원본 동작) */
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of data) {
      const key = it.orderNumber ?? "UNKNOWN";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    return Array.from(map.entries()).map(([orderNumber, items]) => {
      const head = items[0] ?? {};
      const totals = {
        originPrice:
          head.originPrice ??
          items.reduce((s, x) => s + (Number(x.price) || 0) * (Number(x.quantity) || 1), 0),
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

  /** 취소 건 제외한 표시 대상 */
  const visibleGroups = useMemo(
    () =>
      grouped.filter(
        (g) => !["ALL_CANCELLED", "PARTIAL_CANCELLED"].includes(g.orderStatus)
      ),
    [grouped]
  );

  /** 집계 (취소 제외) */
  const counts = useMemo(() => {
    const all = visibleGroups.length;
    let ready = 0;
    let completed = 0;
    for (const g of visibleGroups) {
      if (g.orderStatus === "COMPLETED") completed++;
      else ready++; // PAID/PENDING 등
    }
    return { all, ready, completed };
  }, [visibleGroups]);

  /** 필터 적용 (취소 제외) */
  const filtered = useMemo(() => {
    switch (filter) {
      case "ready":
        return visibleGroups.filter((g) => g.orderStatus !== "COMPLETED");
      case "completed":
        return visibleGroups.filter((g) => g.orderStatus === "COMPLETED");
      default:
        return visibleGroups;
    }
  }, [visibleGroups, filter]);

  /** 화면 상태 */
  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="absolute top-0 left-0 right-0 -mx-4">
          <div className="h-48 bg-gradient-to-b from-emerald-200/40 via-emerald-100/20 to-transparent" />
        </div>
        <main className="relative z-10 px-4 pt-20">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
              <div className="text-gray-500 text-sm">불러오는 중...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="absolute top-0 left-0 right-0 -mx-4">
          <div className="h-48 bg-gradient-to-b from-emerald-200/40 via-emerald-100/20 to-transparent" />
        </div>
        <main className="relative z-10 px-4 pt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">{error}</div>
        </main>
      </div>
    );
  }
  if (!visibleGroups.length) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="absolute top-0 left-0 right-0 -mx-4">
          <div className="h-48 bg-gradient-to-b from-emerald-200/40 via-emerald-100/20 to-transparent" />
        </div>
        <main className="relative z-10 px-4 pt-16">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🥗</span>
            </div>
            <div className="text-gray-600 mb-2">푸드딜 주문내역이 없습니다</div>
            <div className="text-gray-400 text-sm">주문이 생성되면 이곳에 표시됩니다</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* 상단 그라데이션 배경 */}
      <div className="absolute top-0 left-0 right-0 -mx-4">
        <div className="h-48 bg-gradient-to-b from-emerald-200/40 via-emerald-100/20 to-transparent" />
      </div>

      <main className="relative z-10 px-4 pb-20 pt-8">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">푸드딜 주문내역</h1>
          <p className="text-sm text-gray-500 mt-1">픽업 전 QR 확인이 필요해요</p>
        </div>

        {/* 필터 버튼: 전체 / 대기 / 픽업완료 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${filter === "all"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 border border-gray-200/50"
              }`}
          >
            전체 {counts.all}
          </button>
          <button
            onClick={() => setFilter("ready")}
            className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${filter === "ready"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 border border-gray-200/50"
              }`}
          >
            대기 {counts.ready}
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${filter === "completed"
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 border border-gray-200/50"
              }`}
          >
            픽업완료 {counts.completed}
          </button>
        </div>

        {/* 주문 카드 리스트 */}
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.orderNumber}
              order={order}
              onOpenQr={openQr}
              onNavigate={navigate}
            />
          ))}
        </div>
      </main>

      {/* QR 모달 */}
      {qrOpen && (
        <>
          {/* 간단한 등장 애니메이션 */}
          <style>
            {`
        @keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { transform: translateY(8px) scale(.97); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
      `}
          </style>

          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 오버레이 */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              style={{ animation: "overlayIn .18s ease-out both" }}
              onClick={() => setQrOpen(false)}
            />

            {/* 카드 (그라데이션 보더 + 글래스 느낌) */}
            <div
              className="relative w-[88vw] max-w-sm p-[1px] rounded-3xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-2xl"
              style={{ animation: "popIn .22s ease-out both" }}
              role="dialog"
              aria-modal="true"
              aria-label="QR 코드"
            >
              <div className="rounded-3xl bg-white">
                {/* 헤더 */}
                <div className="px-5 pt-4 pb-3 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">QR 코드</div>
                    <p className="text-xs text-gray-500 mt-1">
                      픽업 시 매장에서 화면을 밝게 하고 제시해주세요
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQrOpen(false)}
                    className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    aria-label="닫기"
                  >
                    ✕
                  </button>
                </div>

                {/* 이미지 영역 */}
                <div className="px-5 pb-4">
                  <div className="relative rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
                    {/* 스켈레톤/로더 */}
                    {!qrLoaded && (
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                      </div>
                    )}

                    <img
                      src={qrUrl}
                      alt="Eco Deal QR"
                      className={`w-full aspect-square object-contain transition-opacity duration-200 ${qrLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setQrLoaded(true)}
                      onError={() => setQrLoaded(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

/** 하위 컴포넌트: 주문 카드 */
function OrderCard({ order, onOpenQr, onNavigate }) {
  const badge = getStatusChip(order.orderStatus);
  const isCompleted = order.orderStatus === "COMPLETED";

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden hover:shadow-lg hover:bg-white/90 transition-all duration-300">
      {/* 헤더 */}
      <header className="px-4 py-3 border-b border-gray-100">
        {/* 첫 번째 줄: 주문번호 + 날짜 + QR버튼 */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
            <span className="text-sm font-medium text-gray-700 truncate">
              주문번호 {formatOrderNumber(order.orderNumber)}
            </span>
            <span className="text-gray-300 flex-shrink-0 hidden sm:inline">•</span>
            <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:inline">{order.createdAt}</span>
          </div>

          <div className="flex-shrink-0">
            {isCompleted ? null : order.ecoDealQrUrl ? (
              <button
                type="button"
                onClick={() => onOpenQr(order.ecoDealQrUrl)}
                className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-sm font-semibold border border-gray-900 text-gray-900 hover:bg-gray-50 whitespace-nowrap"
              >
                QR 보기
              </button>
            ) : (
              <span className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-sm font-semibold border border-gray-200 text-gray-500 bg-gray-50 whitespace-nowrap">
                QR 미발급
              </span>
            )}
          </div>
        </div>

        {/* 두 번째 줄: 날짜(모바일에서만) + 상태 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 sm:hidden">{order.createdAt}</span>
            <StatusPill {...badge} />
          </div>
        </div>
      </header>

      {/* 상품 리스트 */}
      <ul className="divide-y divide-gray-100">
        {order.items.map((p) => (
          <li
            key={`${order.orderNumber}-${p.productId}`}
            className="flex gap-3 p-3 cursor-pointer hover:bg-white transition-colors"
            onClick={() => onNavigate(`/eco-deal/detail?productId=${p.productId}`)}
          >
            <img
              src={p.imageUrl}
              alt={p.productName}
              loading="lazy"
              className={`w-16 h-16 object-cover rounded-lg bg-gray-100 ${p.cancelStatus === "Y" ? "opacity-60" : ""
                }`}
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <div className="grid gap-1 flex-1 min-w-0">
              <div
                className={`font-semibold text-sm text-gray-900 truncate ${p.cancelStatus === "Y" ? "line-through text-gray-400" : ""
                  }`}
                title={p.productName}
              >
                {p.productName}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-xs">
                  {p.brandName} · {p.categoryName}
                </div>
                <div className="font-bold text-sm">
                  {fmtPrice(p.price)}{" "}
                  <span className="text-gray-400 font-normal ml-1">× {p.quantity}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* 합계 */}
      <footer className="px-4 py-3 bg-white">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">상품합계</span>
          <strong>{fmtPrice(order.totals.originPrice)}원</strong>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">포인트</span>
          <strong>-{fmtPrice(order.totals.usedPoint)}원</strong>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">기부금</span>
          <strong>-{fmtPrice(order.totals.donationPrice)}원</strong>
        </div>
        <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-300 pt-2 mt-2">
          <span className="text-gray-800">최종</span>
          <strong className="text-black">{fmtPrice(order.totals.finalPayPrice)}원</strong>
        </div>

        {/* 상태 안내 배너 (취소는 애초에 제외) */}
        {!isCompleted && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            픽업 시 <b>QR 코드</b>가 필요합니다. 상단의 <b>QR 보기</b> 버튼을 눌러 확인하세요.
          </div>
        )}
      </footer>
    </section>
  );
}

/** 표시용 유틸 */
function fmtPrice(n) {
  const num = typeof n === "number" ? n : Number(n ?? 0);
  return num.toLocaleString("ko-KR");
}
function getStatusChip(status) {
  const norm = String(status || "").toUpperCase();
  if (norm === "COMPLETED")
    return { text: "픽업완료", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (norm === "PAID")
    return { text: "구매확정", className: "bg-blue-50 text-blue-700 border-blue-200" };
  // 취소는 화면에서 제외되지만, 방어적으로 남겨둠
  if (norm === "ALL_CANCELLED")
    return { text: "전체취소됨", className: "bg-rose-50 text-rose-700 border-rose-200" };
  if (norm === "PARTIAL_CANCELLED")
    return { text: "부분취소됨", className: "bg-amber-50 text-amber-700 border-amber-200" };
  return { text: "구매확정 대기중", className: "bg-gray-50 text-gray-700 border-gray-200" };
}
function StatusPill({ text, className }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${className}`}>
      {text}
    </span>
  );
}
