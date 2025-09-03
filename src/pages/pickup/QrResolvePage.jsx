import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resolveQr } from "@/api/pickup/qr.api";

export default function QrResolvePage() {
  const [sp] = useSearchParams();
  const d = sp.get("d");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [raw, setRaw] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    (async () => {
      if (!d) {
        setErr("잘못된 접근입니다. (d 파라미터 없음)");
        setLoading(false);
        return;
      }
      try {
        const res = await resolveQr(d);
        setRaw(res);

        const isWrapped = res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "success");
        if (isWrapped && !res.success) {
          setErr(res?.message || "주문 정보를 확인할 수 없습니다.");
          return;
        }
        const payload = isWrapped ? res.data : res;
        const mapped = mapOrderPayload(payload);
        setOrder(mapped);
      } catch (e) {
        // 상태코드별 사용자 메시지
        const code = e?.response?.status;
        if (code === 410) setErr("QR이 만료되었습니다. 다시 발급 받아주세요.");
        else if (code === 401) setErr("유효하지 않은 QR 입니다.");
        else if (code === 403) setErr("접근 권한이 없습니다.");
        else if (code === 404) setErr("주문을 찾을 수 없습니다.");
        else setErr("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    })();
  }, [d]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-2">QR 확인 실패</h2>
        <p className="text-red-600 mb-4">{err}</p>

        {/* 디버그에 도움: 서버가 무엇을 보냈는지 원본 응답 출력 */}
        {raw && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-500">응답 원본 보기</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(raw, null, 2)}
            </pre>
          </details>
        )}

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded bg-gray-900 text-white"
        >
          홈으로
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-2">표시할 주문 정보가 없습니다.</h2>
        <button onClick={() => navigate("/")} className="px-4 py-2 rounded bg-gray-900 text-white">
          홈으로
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">주문 확인</h1>

      <div className="rounded-2xl border p-4 mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">주문번호</span>
          <span className="font-medium">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">매장</span>
          <span className="font-medium">{order.storeName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">결제금액</span>
          <span className="font-semibold">
            {Number(order.totalAmount || 0).toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">상품 목록</h3>
      <ul className="divide-y rounded-2xl border">
        {(order.products || []).map((p) => (
          <li key={p.productId ?? `${p.productName}-${p.quantity}`} className="flex justify-between p-3">
            <span className="truncate pr-4">{p.productName}</span>
            <span className="tabular-nums">× {p.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-2">
        <button onClick={() => navigate("/")} className="px-4 py-2 rounded-xl border">
          돌아가기
        </button>
        <button
          onClick={() => navigate(`/pickup/confirm?oid=${order.orderId}`)}
          className="ml-auto px-4 py-2 rounded-xl bg-emerald-600 text-white"
        >
          픽업 확인 진행
        </button>
      </div>
    </div>
  );
}

/** 서버 응답의 케이스/구조 차이를 흡수해서 화면용 객체로 매핑 */
function mapOrderPayload(x = {}) {
  const toNum = (v) => (v == null ? 0 : Number(v));
  const prodSrc = Array.isArray(x.products)
    ? x.products
    : Array.isArray(x.items)
    ? x.items
    : [];

  return {
    orderId:     x.orderId     ?? x.order_id,
    orderNumber: x.orderNumber ?? x.order_number,
    storeId:     x.storeId     ?? x.store_id,
    storeName:   x.storeName   ?? x.store_name,
    totalAmount: toNum(x.totalAmount ?? x.total_amount),
    products:    prodSrc.map((p) => ({
      productId:   p.productId   ?? p.product_id,
      productName: p.productName ?? p.product_name,
      quantity:    toNum(p.quantity),
    })),
  };
}