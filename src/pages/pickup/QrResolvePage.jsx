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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">QR 코드를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* 헤더 */}
        <div className="bg-white px-6 pt-12 pb-8 text-center">
          {/* 에러 아이콘 */}
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">QR 확인 실패</h1>
          <p className="text-gray-600 text-sm">{err}</p>
        </div>

        {/* 구분선 */}
        <div className="border-t border-dashed border-gray-300 mx-6"></div>

        {/* 디버그 정보 */}
        <div className="flex-1 px-6 py-6 pb-24">
          {raw && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-black">
                응답 원본 보기
              </summary>
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(raw, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white p-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* 헤더 */}
        <div className="bg-white px-6 pt-12 pb-8 text-center">
          {/* 정보 없음 아이콘 */}
          <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">주문 정보 없음</h1>
          <p className="text-gray-600 text-sm">표시할 주문 정보가 없습니다</p>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white p-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-8 text-center">
        {/* 성공 아이콘 */}
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-2">주문 확인 완료</h1>
        <p className="text-gray-600 text-sm">픽업 주문 정보를 확인했습니다</p>
      </div>

      {/* 구분선 */}
      <div className="border-t border-dashed border-gray-300 mx-6"></div>

      {/* 주문 정보 */}
      <div className="flex-1 px-6 py-6 pb-24">
        <div className="space-y-4">
          {/* 주문번호 */}
          <div className="text-center pb-4 border-b border-gray-200">
            <p className="text-gray-600 text-sm mb-1">주문번호</p>
            <p className="font-mono text-lg font-bold text-gray-900">
              {order.orderNumber}
            </p>
          </div>

          {/* 매장 정보 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">매장</span>
            <span className="font-medium text-sm">{order.storeName}</span>
          </div>

          {/* 결제금액 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">결제금액</span>
            <span className="font-bold text-black text-lg">
              {Number(order.totalAmount || 0).toLocaleString("ko-KR")}원
            </span>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* 상품 목록 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">주문 상품</h3>
            <div className="space-y-3">
              {(order.products || []).map((p) => (
                <div key={p.productId ?? `${p.productName}-${p.quantity}`} className="flex justify-between items-center py-2">
                  <span className="text-gray-900 text-sm flex-1 pr-4">{p.productName}</span>
                  <span className="text-gray-600 text-sm">× {p.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white p-4 border-t border-gray-200">
        <button
          onClick={() => navigate("/")}
          className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          확인 완료
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