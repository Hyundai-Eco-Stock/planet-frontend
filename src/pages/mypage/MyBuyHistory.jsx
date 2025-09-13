import React, { useEffect, useMemo, useState } from "react";
import { fetchMyOrders } from "@/api/member/member.api";
import { confirmOrder } from "@/api/order/order.api";
import { cancelPartialOrder } from "@/api/payment/payment.api";
import { useNavigate, useOutletContext } from "react-router-dom";

/** utils */
const currency = (v) => (v == null ? "-" : `${Number(v).toLocaleString("ko-KR")}원`);
const formatDate = (s) => {
  try {
    const d = new Date(String(s).replace(" ", "T"));
    return d.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  } catch (_) {
    return s;
  }
};

// 주문번호 정리 함수
const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return 'N/A'

  let cleanNumber = orderNumber.replace(/^draft_/, '')

  if (cleanNumber.includes('_')) {
    const parts = cleanNumber.split('_')
    if (parts.length >= 2) {
      cleanNumber = parts[parts.length - 1].toUpperCase()
    }
  }

  return cleanNumber
}

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
const StatusChip = ({ status }) => {
  const raw = String(status || "").toUpperCase();
  const norm = {
    PAID: "PAID",
    DONE: "DONE",
    COMPLETED: "COMPLETED",
    ALL_CANCELLED: "ALL_CANCELLED",
    PARTIAL_CANCELLED: "PARTIAL_CANCELLED",
  }[raw] || "PENDING";

  const labelMap = {
    PAID: "결제완료",
    DONE: "구매확정",
    COMPLETED: "픽업완료",
    ALL_CANCELLED: "취소됨",
    PARTIAL_CANCELLED: "취소됨",
    PENDING: "처리중",
  };

  const colorMap = {
    PAID: "bg-blue-100 text-blue-600",
    DONE: "bg-emerald-100 text-emerald-600",
    COMPLETED: "bg-emerald-100 text-emerald-600",
    ALL_CANCELLED: "bg-red-100 text-red-600",
    PARTIAL_CANCELLED: "bg-red-100 text-red-600",
    PENDING: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[norm]}`}>
      {labelMap[norm]}
    </span>
  );
};

export default function MyBuyHistory() {
  const { setTitle } = useOutletContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  // 주문별 선택된 상품 상태: { [orderHistoryId]: Set<orderProductId> }
  const [selectedByOrder, setSelectedByOrder] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setTitle("주문 관리");
  }, [setTitle]);

  useEffect(() => {
    setLoading(true);
    fetchMyOrders()
      .then((res) => setRows(Array.isArray(res) ? res : []))
      .catch((e) => setError(e?.message || "주문 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => groupOrders(rows), [rows]);

  // 필터링된 주문 목록
  const filteredGroups = useMemo(() => {
    if (filter === 'all') return groups;

    return groups.filter(order => {
      const orderStatus = String(order.orderStatus).toUpperCase();

      switch (filter) {
        case 'confirmed':
          return orderStatus === "DONE" || orderStatus === "COMPLETED";
        case 'cancelled':
          return orderStatus === "ALL_CANCELLED" || orderStatus === "PARTIAL_CANCELLED";
        default:
          return true;
      }
    });
  }, [groups, filter]);

  // 상태별 개수 계산
  const orderCounts = useMemo(() => {
    const confirmed = groups.filter(order => {
      const orderStatus = String(order.orderStatus).toUpperCase();
      return orderStatus === "DONE" || orderStatus === "COMPLETED";
    }).length;

    const cancelled = groups.filter(order => {
      const orderStatus = String(order.orderStatus).toUpperCase();
      return orderStatus === "ALL_CANCELLED" || orderStatus === "PARTIAL_CANCELLED";
    }).length;

    return { confirmed, cancelled };
  }, [groups]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="absolute top-0 left-0 right-0 -mx-4">
          <div className="bg-gradient-to-b from-purple-200/40 via-purple-100/20 to-transparent h-60">
          </div>
        </div>
        <main className="relative z-10 px-4 pb-20 pt-20">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
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
          <div className="bg-gradient-to-b from-purple-200/40 via-purple-100/20 to-transparent h-60">
          </div>
        </div>
        <main className="relative z-10 px-4 pb-20 pt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="absolute top-0 left-0 right-0 -mx-4">
          <div className="bg-gradient-to-b from-purple-200/40 via-purple-100/20 to-transparent h-60">
          </div>
        </div>
        <main className="relative z-10 px-4 pb-20 pt-20">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <div className="text-gray-500 mb-2">구매 내역이 없습니다</div>
            <div className="text-gray-400 text-sm">상품을 구매하면 여기에 표시됩니다</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* 상단 그라데이션 배경 */}
      <div className="absolute top-0 left-0 right-0 -mx-4">
        <div className="bg-gradient-to-b from-purple-200/40 via-purple-100/20 to-transparent h-60">
        </div>
      </div>

      <main className="relative z-10 px-4 pb-20 pt-8">
        {/* 필터 버튼 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${filter === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 hover:scale-105 border border-gray-200/50'
              }`}
          >
            전체 {groups.length}건
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${filter === 'confirmed'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 hover:scale-105 border border-gray-200/50'
              }`}
          >
            구매확정 {orderCounts.confirmed}건
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${filter === 'cancelled'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 hover:scale-105 border border-gray-200/50'
              }`}
          >
            취소됨 {orderCounts.cancelled}건
          </button>
        </div>

        {/* 주문 목록 */}
        {filteredGroups.length > 0 ? (
          <div className="space-y-4">
            {filteredGroups.map((order) => {
              const orderStatusUpper = String(order.orderStatus).toUpperCase();
              const paymentStatusUpper = String(order.paymentStatus).toUpperCase();

              const headerStatus = (() => {
                if (orderStatusUpper === "ALL_CANCELLED") return "ALL_CANCELLED";
                if (orderStatusUpper === "PARTIAL_CANCELLED") return "PARTIAL_CANCELLED";
                if (orderStatusUpper === "DONE" || orderStatusUpper === "COMPLETED") return "DONE";
                if (orderStatusUpper === "PAID" && paymentStatusUpper === "DONE") return "PAID";
                return "PENDING";
              })();

              const selectedSet = selectedByOrder[order.orderHistoryId] || new Set();

              const toggleSelect = (productId) => {
                setSelectedByOrder(prev => {
                  const current = new Set(prev[order.orderHistoryId] || []);
                  if (current.has(productId)) current.delete(productId); else current.add(productId);
                  return { ...prev, [order.orderHistoryId]: Array.from(current) };
                });
              };

              const getSelectedIds = () => Array.from(selectedByOrder[order.orderHistoryId] || []);

              const resetSelection = () => setSelectedByOrder(prev => ({ ...prev, [order.orderHistoryId]: [] }));

              const handleConfirm = async () => {
                const selectedIds = getSelectedIds();
                if (selectedIds.length === 0) {
                  alert('구매확정할 상품을 선택하세요.');
                  return;
                }
                try {
                  await confirmOrder(order.orderHistoryId, selectedIds);
                  alert('구매확정이 완료되었습니다.');
                  resetSelection();
                  setLoading(true);
                  const res = await fetchMyOrders();
                  setRows(Array.isArray(res) ? res : []);
                } catch (e) {
                  alert(e?.message || '구매확정 중 오류가 발생했습니다.');
                } finally {
                  setLoading(false);
                }
              };

              const handleCancel = async () => {
                const selectedIds = getSelectedIds();
                if (selectedIds.length === 0) {
                  alert('취소할 상품을 선택하세요.');
                  return;
                }
                // 에코딜 상품은 취소 불가 처리
                const ecoSelected = order.items.filter(p => selectedIds.includes(p.orderProductId)).some(p => String(p.ecoDealStatus).toUpperCase() === 'Y');
                if (ecoSelected) {
                  alert('에코딜 상품은 결제 후 취소가 불가능합니다.');
                  return;
                }
                if (!window.confirm('선택한 상품을 취소하시겠습니까?')) return;
                try {
                  await cancelPartialOrder(order.orderHistoryId, selectedIds);
                  alert('선택한 상품 취소가 완료되었습니다.');
                  resetSelection();
                  setLoading(true);
                  const res = await fetchMyOrders();
                  setRows(Array.isArray(res) ? res : []);
                } catch (e) {
                  alert(e?.message || '취소 처리 중 오류가 발생했습니다.');
                } finally {
                  setLoading(false);
                }
              };

              return (
                <div
                  key={order.orderHistoryId}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 hover:shadow-lg hover:bg-white/90 hover:border-gray-300/50 transition-all duration-300"
                >
                  {/* 주문 헤더 */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        주문번호 {formatOrderNumber(order.orderNumber)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <StatusChip status={headerStatus} />
                  </div>

                  {/* 상품 목록 */}
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={item.orderProductId || index}
                        className="flex items-center gap-3 hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        {headerStatus === 'PAID' ? (
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-emerald-600 ml-2 mr-1"
                            checked={selectedSet instanceof Set ? selectedSet.has(item.orderProductId) : (selectedSet || []).includes(item.orderProductId)}
                            onChange={() => toggleSelect(item.orderProductId)}
                            disabled={String(item.cancelStatus).toUpperCase() === 'Y'}
                          />
                        ) : null}
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-sm">📦</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/shopping/main?detail=${item.productId}`)}>
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {item.productName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.quantity}개 • {currency(item.finalProductPrice || item.price)}
                          </div>
                        </div>
                        {String(item.cancelStatus).toUpperCase() === 'Y' && (
                          <span className="text-xs text-red-500 ml-auto">취소됨</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 결제 정보 */}
                  <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                    {/* 기본 가격 정보 */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">상품금액</span>
                      <span className="text-gray-900">{currency(order.originPrice)}</span>
                    </div>

                    {/* 포인트 사용 */}
                    {order.usedPoint > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">포인트 사용</span>
                        <span className="text-red-600">-{currency(order.usedPoint)}</span>
                      </div>
                    )}

                    {/* 기부금 */}
                    {order.donationPrice > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">기부금</span>
                        <span className="text-green-600">+{currency(order.donationPrice)}</span>
                      </div>
                    )}

                    {/* 기부금 환불 (취소 시) */}
                    {order.refundDonationPrice > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">기부금 환불</span>
                        <span className="text-amber-600">-{currency(order.refundDonationPrice)}</span>
                      </div>
                    )}

                    {/* 최종 결제 금액 */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        총 결제금액
                      </div>
                      <div className="font-bold text-lg text-black">
                        {currency(order.finalPayPrice)}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼: 결제완료 상태에서만 노출 */}
                  {headerStatus === 'PAID' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={handleCancel}
                      >
                        취소
                      </button>
                      <button
                        className="flex-1 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={handleConfirm}
                      >
                        구매확정
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200/50">
              <span className="text-2xl">📦</span>
            </div>
            <div className="text-gray-600 mb-2">해당 조건의 주문이 없습니다</div>
            <div className="text-gray-500 text-sm">다른 상태를 확인해보세요</div>
          </div>
        )}
      </main>
    </div>
  );
}
