import React, { useEffect, useMemo, useState } from "react";
import { fetchMyOrders } from "@/api/member/member.api";
import { cancelEntireOrder, cancelPartialOrder } from "@/api/payment/payment.api";
import { confirmOrder } from "@/api/order/order.api";
import { useNavigate, useOutletContext } from "react-router-dom";

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
        refundDonationPrice: r.refundDonationPrice || 0,
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
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const StatusChip = ({ status }) => {
  const raw = String(status || "").toUpperCase();
  const norm = {
    PAID: "PAID",
    DONE: "DONE",
    COMPLETED: "COMPLETED",
    ALL_CANCELLED: "ALL_CANCELLED",
    ALL_CANCELED: "ALL_CANCELLED",
    PARTIAL_CANCELLED: "PARTIAL_CANCELLED",
    PARTIAL_CANCELED: "PARTIAL_CANCELLED",
  }[raw] || "PENDING";

  const labelMap = {
    PAID: "결제완료",
    DONE: "구매확정",
    COMPLETED: "픽업완료",
    ALL_CANCELLED: "전체취소",
    PARTIAL_CANCELLED: "부분취소",
    PENDING: "처리중",
  };
  const colorMap = {
    PAID: "bg-gray-100 text-gray-800 border border-gray-200",
    DONE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    ALL_CANCELLED: "bg-red-50 text-red-700 border border-red-200",
    PARTIAL_CANCELLED: "bg-amber-50 text-amber-700 border border-amber-200",
    PENDING: "bg-gray-50 text-gray-700 border border-gray-200",
  };
  return <Chip className={colorMap[norm]}>{labelMap[norm]}</Chip>;
};

const EcoChip = ({ eco }) => (
  eco ? (
    <Chip className="bg-emerald-50 text-emerald-700 border border-emerald-200">에코딜</Chip>
  ) : (
    <Chip className="bg-gray-50 text-gray-600 border border-gray-200">일반</Chip>
  )
);

/** main */
export default function MyBuyHistory() {

  const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("상품 구매 내역");
    }, [setTitle]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const [selectedByOrder, setSelectedByOrder] = useState({});
  const [cancelModal, setCancelModal] = useState({
    open: false,
    orderId: null,
    items: [],
    reason: "",
    isPartial: false,
    refundDonation: false,
    donationAmount: 0
  });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    orderId: null,
    items: [],
    isPartial: false
  });

  const toggleSelect = (orderId, orderProductId, checked) => {
    setSelectedByOrder((prev) => {
      const set = new Set(prev[orderId] || []);
      if (checked) set.add(orderProductId);
      else set.delete(orderProductId);
      return { ...prev, [orderId]: set };
    });
  };

  // 주문 데이터 새로고침
  const refreshOrders = async () => {
    try {
      const res = await fetchMyOrders();
      console.log('새로고침된 주문 데이터:', res); // 이 로그 추가
      setRows(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('주문 목록 새로고침 실패:', e);
    }
  };

  // 취소 처리
  const handleCancel = async () => {
    if (!cancelModal.orderId || cancelModal.items.length === 0) return;

    setActionLoading(true);
    try {
      const { orderId, items, reason, isPartial, refundDonation } = cancelModal;

      if (isPartial) {
        await cancelPartialOrder(orderId, items, reason, refundDonation);
        alert('부분 취소가 완료되었습니다.');
      } else {
        await cancelEntireOrder(orderId, reason);
        alert('전체 취소가 완료되었습니다.');
      }

      await refreshOrders();
      setSelectedByOrder(prev => ({ ...prev, [orderId]: new Set() }));

    } catch (error) {
      console.error('취소 처리 실패:', error);
      alert(`취소 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setActionLoading(false);
      setCancelModal({ open: false, orderId: null, items: [], reason: "", isPartial: false, refundDonation: false, donationAmount: 0 });
    }
  };

  // 확정 처리
  const handleConfirm = async () => {
    if (!confirmModal.orderId) return;

    setActionLoading(true);
    try {
      const { orderId, items, isPartial } = confirmModal;

      if (isPartial && items.length > 0) {
        await confirmOrder(orderId, items);
        alert('선택한 상품의 구매 확정이 완료되었습니다.');
      } else {
        await confirmOrder(orderId, []);
        alert('전체 구매 확정이 완료되었습니다.');
      }

      await refreshOrders();
      setSelectedByOrder(prev => ({ ...prev, [orderId]: new Set() }));

    } catch (error) {
      console.error('확정 처리 실패:', error);
      alert(`구매 확정 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, orderId: null, items: [], isPartial: false });
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMyOrders()
      .then((res) => setRows(Array.isArray(res) ? res : []))
      .catch((e) => setError(e?.message || "주문 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => groupOrders(rows), [rows]);

  if (loading) return <div className="p-6 text-center text-gray-500">로딩 중...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!groups.length) return <div className="p-6 text-center text-gray-500">구매 내역이 없습니다.</div>;

  return (
    <main className="p-4 space-y-4">
      {groups.map((order) => {
        const orderStatusUpper = String(order.orderStatus).toUpperCase();
        const paymentStatusUpper = String(order.paymentStatus).toUpperCase();

        const isCompleted = orderStatusUpper === "DONE" || orderStatusUpper === "COMPLETED";
        const isAllCancelled = orderStatusUpper === "ALL_CANCELLED";
        const isPartialCancelled = orderStatusUpper === "PARTIAL_CANCELLED";
        const isPaid = orderStatusUpper === "PAID" && paymentStatusUpper === "DONE";

        const showActionButtons = (isPaid || isPartialCancelled) && !isCompleted && !isAllCancelled;
        const availableItems = order.items.filter(item => item.cancelStatus !== "Y");
        const selectedItems = Array.from(selectedByOrder[order.orderHistoryId] || []);
        const totalItems = order.items.length;

        const headerStatus = (() => {
          if (isAllCancelled) return "ALL_CANCELLED";
          if (isPartialCancelled) return "PARTIAL_CANCELLED";
          if (isCompleted) return "DONE";
          if (isPaid) return "PAID";
          return "PENDING";
        })();

        return (
          <div key={order.orderHistoryId} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* 상단 컬러 바 */}
            <div className={`h-1 ${order.ecoAny ? "bg-emerald-400" : "bg-gray-400"}`} />

            {/* 헤더 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    주문번호 {order.orderNumber}
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                </div>
                <StatusChip status={headerStatus} />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{currency(order.finalPayPrice)}</div>
              </div>
            </div>

            {/* 전체 선택 체크박스 - 상품 목록 위에 */}
            {showActionButtons && (
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`selectAll-${order.orderHistoryId}`}
                    className="w-4 h-4 accent-emerald-600"
                    checked={selectedItems.length === availableItems.length && availableItems.length > 0}
                    onChange={(e) => {
                      const allProductIds = availableItems.map(item => item.orderProductId);
                      if (e.target.checked) {
                        // 전체 선택
                        setSelectedByOrder(prev => ({
                          ...prev,
                          [order.orderHistoryId]: new Set(allProductIds)
                        }));
                      } else {
                        // 전체 해제
                        setSelectedByOrder(prev => ({
                          ...prev,
                          [order.orderHistoryId]: new Set()
                        }));
                      }
                    }}
                  />
                  <label
                    htmlFor={`selectAll-${order.orderHistoryId}`}
                    className="text-sm text-gray-700 cursor-pointer font-medium"
                  >
                    전체 선택 ({availableItems.length}개)
                  </label>
                </div>
              </div>
            )}

            {/* 상품 목록 */}
            <div className="px-4 pb-4 space-y-3">
              {order.items.map((it) => {
                const unitPrice = Number(
                  it.finalProductPrice != null
                    ? it.finalProductPrice
                    : (Number(it.price || 0) - Number(it.discountPrice || 0))
                );
                const lineTotal = unitPrice * Number(it.quantity || 1);
                const eco = it.ecoDealStatus === "Y";
                const isCancelled = it.cancelStatus === "Y";
                const canSelect = showActionButtons && !isCancelled;

                return (
                  <div
                    key={it.orderProductId}
                    onClick={() =>
                      navigate(
                        it.ecoDealStatus === "Y"
                          ? `/eco-deal/detail?productId=${it.productId}`
                          : `/shopping/detail?productId=${it.productId}`
                      )
                    }
                    className={`relative cursor-pointer rounded-lg border border-gray-200 bg-white hover:bg-gray-50 p-3 flex items-center gap-3
                      ${isCancelled || isAllCancelled ? "opacity-50 grayscale" : ""} 
                      ${isCompleted && !isCancelled ? "ring-1 ring-emerald-200 bg-emerald-50/20" : ""}`}
                  >
                    {/* 체크박스 */}
                    {canSelect && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-emerald-600"
                        checked={Boolean(selectedByOrder[order.orderHistoryId]?.has(it.orderProductId))}
                        onChange={(e) => toggleSelect(order.orderHistoryId, it.orderProductId, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    {/* 상품 이미지 */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-xs">이미지</span>
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate mb-1">
                        {it.productName}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <EcoChip eco={eco} />
                        {isPartialCancelled && (
                          isCancelled ? (
                            <Chip className="bg-red-50 text-red-700 border border-red-200">취소됨</Chip>
                          ) : (
                            <Chip className="bg-gray-100 text-gray-700 border border-gray-200">유지</Chip>
                          )
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        수량 {it.quantity} · {currency(unitPrice)}
                        {Number(it.salePercent || 0) > 0 && (
                          <span className="ml-1 text-red-600">-{Number(it.salePercent)}%</span>
                        )}
                      </div>
                    </div>

                    {/* 가격 & 배지 */}
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-sm mb-1">{currency(lineTotal)}</div>

                      {isCompleted && it.cancelStatus !== "Y" && (
                        <Chip className="bg-emerald-600 text-white">확정</Chip>
                      )}

                      {it.cancelStatus === "Y" && (
                        <Chip className="bg-gray-500 text-white">취소</Chip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 액션 버튼 */}
            {showActionButtons && (
              <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {selectedItems.length > 0 && `${selectedItems.length}개 선택`}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('=== 취소 버튼 클릭 디버깅 ===');
                      console.log('order.donationPrice:', order.donationPrice);
                      console.log('order.refundDonationPrice:', order.refundDonationPrice);

                      const selectedItems = Array.from(selectedByOrder[order.orderHistoryId] || []);
                      const availableItems = order.items.filter(item => item.cancelStatus !== "Y");

                      const isEntireCancel = selectedItems.length === availableItems.length &&
                        availableItems.length === order.items.length;

                      console.log('isEntireCancel:', isEntireCancel);

                      let showDonationOption = false;
                      let remainingDonation = 0;

                      if (isEntireCancel) {
                        remainingDonation = (order.donationPrice || 0) - (order.refundDonationPrice || 0);
                        showDonationOption = remainingDonation > 0;
                      } else {
                        showDonationOption = (order.refundDonationPrice || 0) === 0 && (order.donationPrice || 0) > 0;
                        if (showDonationOption) {
                          remainingDonation = order.donationPrice || 0;
                        }
                      }

                      console.log('showDonationOption:', showDonationOption);
                      console.log('remainingDonation:', remainingDonation);

                      setCancelModal({
                        open: true,
                        orderId: order.orderHistoryId,
                        items: selectedItems,
                        reason: "",
                        isPartial: !isEntireCancel,
                        refundDonation: false,
                        donationAmount: showDonationOption ? remainingDonation : 0
                      });
                    }}
                    disabled={selectedItems.length === 0 || actionLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium
                      ${selectedItems.length > 0 && !actionLoading
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-400"}`}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const selectedItems = Array.from(selectedByOrder[order.orderHistoryId] || []);
                      const availableItems = order.items.filter(item => item.cancelStatus !== "Y");

                      // 전체 선택 여부 확인
                      const isAllSelected = selectedItems.length === availableItems.length && availableItems.length > 0;

                      if (!isAllSelected) {
                        // 전체 선택이 안된 경우 경고 메시지
                        alert(`구매 확정을 위해서는 모든 상품(${availableItems.length}개)을 선택해주세요.`);
                        return;
                      }

                      setConfirmModal({
                        open: true,
                        orderId: order.orderHistoryId,
                        items: [], // 빈 배열 = 전체 확정
                        isPartial: false // 항상 전체 확정
                      });
                    }}
                    disabled={actionLoading || availableItems.length === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium
                      ${!actionLoading && availableItems.length > 0
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-400"}`}
                  >
                    구매 확정
                  </button>
                </div>
              </div>
            )}

            {/* 결제 정보 */}
            <div className="p-4 bg-gray-50 rounded-b-lg text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품금액</span>
                  <span>{currency(order.originPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">포인트 사용</span>
                  <span className="text-red-600">-{currency(order.usedPoint)}</span>
                </div>

                {/* 기부금 표시 - 환불 정보 포함 */}
                <div className="flex justify-between">
                  <span className="text-gray-500">기부</span>
                  <div className="text-right">
                    <div className="text-emerald-600">{currency(order.donationPrice)}</div>
                    {order.refundDonationPrice > 0 && (
                      <div className="text-xs text-gray-400">
                        환불: {currency(order.refundDonationPrice)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between font-bold">
                  <span>결제금액</span>
                  <span>{currency(order.finalPayPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 간단한 취소 모달 */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3">주문 취소</h3>
            <textarea
              className="w-full h-20 border border-gray-300 rounded-lg p-2 text-sm"
              placeholder="취소 사유를 입력해 주세요"
              value={cancelModal.reason}
              onChange={(e) => setCancelModal((m) => ({ ...m, reason: e.target.value }))}
            />

            {/* 포인트 절사 안내 */}
            {cancelModal.isPartial && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">💡 안내</p>
                <p className="text-xs text-blue-600 mt-1">
                  부분 취소 시 포인트는 상품 개수에 비례하여 환불되며, 소수점 이하는 절사됩니다.
                </p>
              </div>
            )}

            {cancelModal.isPartial && cancelModal.donationAmount > 0 && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={cancelModal.refundDonation}
                    onChange={(e) => setCancelModal((m) => ({ ...m, refundDonation: e.target.checked }))}
                  />
                  <span className="text-sm">기부금 환불 ({currency(cancelModal.donationAmount)})</span>
                </label>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setCancelModal({ open: false, orderId: null, items: [], reason: "", isPartial: false, refundDonation: false, donationAmount: 0 })}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelModal.items.length === 0 || actionLoading}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm disabled:bg-gray-300"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 간단한 확정 모달 */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3">구매 확정</h3>
            <p className="text-sm text-gray-600 mb-2">
              전체 상품을 확정하시겠습니까?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-700 font-medium">⚠️ 주의사항</p>
              <p className="text-xs text-amber-600 mt-1">
                • 확정 후에는 취소가 불가능합니다<br />
                • 취소하고 싶은 상품이 있다면 먼저 취소 후 확정해주세요
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal({ open: false, orderId: null, items: [], isPartial: false })}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:bg-gray-300"
              >
                확정
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}