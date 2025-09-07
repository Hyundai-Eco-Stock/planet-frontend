import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchEcoDealProductDetail } from "../../api/product/ecoProduct.api";
import Toast from "@/components/common/Toast";
import StoreConflictModal from "@/components/eco-deal/StoreConflictModal";
import useCartStore from "@/store/cartStore";

export default function ShoppingDetail() {
  const [sp] = useSearchParams();
  const productId = sp.get("productId");
  const navigate = useNavigate();

  const [rows, setRows] = useState([]); // 상품 상세 데이터
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);

  // Zustand store 사용
  const { addToCart, checkStoreConflict } = useCartStore();

  useEffect(() => {
    if (!productId) {
      setError("상품 ID가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchEcoDealProductDetail(productId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res ? [res] : []);
        setRows(list);
      })
      .catch((e) => setError(e?.message || "상세 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, [productId]);

  // 메인 정보 파싱
  const main = useMemo(() => rows[0] || null, [rows]);
  const name = main?.productName ?? "상품명";
  const price = main?.price;

  // 수량 상태 및 핸들러
  const [qty, setQty] = useState(1);
  const clampQty = (n) => Math.max(1, Math.min(99, Number.isNaN(n) ? 1 : n));
  const inc = () => setQty((q) => clampQty(q + 1));
  const dec = () => setQty((q) => clampQty(q - 1));
  const onQtyChange = (e) => setQty(clampQty(parseInt(e.target.value, 10)));

  // 구매하기
  const handleBuyNow = () => {
    if (!main) return;
    if (!selectedStoreId) {
      alert('지점을 선택해주세요.');
      return;
    }

    const selectedStore = rows.find(r => String(r.departmentStoreId) === String(selectedStoreId));
    if (!selectedStore) {
      alert('선택된 매장 정보를 찾을 수 없습니다.');
      return;
    }

    const orderProduct = {
      id: main.productId,
      name: main.productName,
      price: Number(main.price ?? 0),
      quantity: Number(qty || 1),
      imageUrl: main.imageUrl || '',
      isEcoDeal: true,
      ecoDealStatus: true,
      salePercent: Number(main.salePercent ?? 0),
      selectedStore: {
        id: selectedStore.departmentStoreId,
        name: selectedStore.departmentStoreName,
        address: selectedStore.address || '',
        latitude: selectedStore.lat ?? null,
        longitude: selectedStore.lng ?? null,
      }
    };

    navigate('/orders', { 
      state: { 
        products: [orderProduct], 
        deliveryType: 'PICKUP',
        fromDirectPurchase: true
      } 
    });
  };

  // 장바구니 담기 (매장 충돌 시 모달)
  const handleAddToCart = () => {
    if (!main) return;
    if (!selectedStoreId) {
      alert('지점을 선택해주세요.');
      return;
    }

    const selectedStore = rows.find(r => String(r.departmentStoreId) === String(selectedStoreId));
    if (!selectedStore) {
      alert('선택된 매장 정보를 찾을 수 없습니다.');
      return;
    }

    // 매장 충돌 검사
    const conflictCheck = checkStoreConflict(main.productId, selectedStore.departmentStoreId);
    
    if (conflictCheck.hasConflict) {
      const canKeepExisting = rows.some(
        r => String(r.departmentStoreId) === String(conflictCheck.existingStore?.id)
      );

      setConflictData({
        productId: main.productId,
        productName: main.productName,
        existingStore: conflictCheck.existingStore,
        newStore: {
          id: selectedStore.departmentStoreId,
          name: selectedStore.departmentStoreName
        },
        existingQuantity: conflictCheck.existingQuantity,
        newQuantity: qty,
        selectedStore: selectedStore,
        canKeepExisting,
      });
      setShowConflictModal(true);
      return;
    }

    // 충돌이 없으면 바로 추가
    addToCartInternal();
  };

  // 실제 장바구니 추가
  const addToCartInternal = (options = {}) => {
    if (!main || !selectedStoreId) return;

    const selectedStore = rows.find(r => String(r.departmentStoreId) === String(selectedStoreId));
    
    const item = {
      id: main.productId,
      name: main.productName,
      price: Number(main.price ?? 0),
      imageUrl: main.imageUrl || '',
      isEcoDeal: true,
      quantity: Number(qty || 1),
      salePercent: Number(main.salePercent ?? 0),
      selectedStore: selectedStore ? {
        id: selectedStore.departmentStoreId,
        name: selectedStore.departmentStoreName,
        latitude: selectedStore.lat ?? null,
        longitude: selectedStore.lng ?? null,
      } : null,
    };

    try {
      addToCart(item, item.quantity, options);
      setShowToast(true);
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      alert('장바구니 저장에 실패했습니다.');
    }
  };

  // 모달: 기존 매장 유지(수량만 증가)
  const handleKeepExisting = () => {
    if (!conflictData?.canKeepExisting) return;
    if (!conflictData) return;
    
    const existingStoreData = rows.find(
      r => String(r.departmentStoreId) === String(conflictData.existingStore.id)
    );
    
    const item = {
      id: conflictData.productId,
      name: conflictData.productName,
      price: Number(main?.price ?? 0),
      imageUrl: main?.imageUrl || '',
      isEcoDeal: true,
      quantity: Number(conflictData.newQuantity || 1),
      salePercent: Number(main?.salePercent ?? 0),
      selectedStore: {
        id: conflictData.existingStore.id,
        name: conflictData.existingStore.name,
        latitude: existingStoreData?.lat ?? null,
        longitude: existingStoreData?.lng ?? null,
      },
    };

    try {
      // 기존 매장으로 수량 증가 (충돌 우회)
      addToCart(item, item.quantity, { force: true });
      setShowToast(true);
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      alert('장바구니 저장에 실패했습니다.');
    }
    
    setShowConflictModal(false);
    setConflictData(null);
  };

  // 모달: 새 매장으로 교체
  const handleReplaceWithNew = () => {
    if (!conflictData) return;
    addToCartInternal({ force: true, action: 'replace' });
    setShowConflictModal(false);
    setConflictData(null);
  };

  const handleCloseConflictModal = () => {
    setShowConflictModal(false);
    setConflictData(null);
  };

  if (loading) return <div className="p-4">불러오는 중…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!main) return <div className="p-4">데이터가 없습니다.</div>;

  return (
    <main className="p-4 max-w-screen-md mx-auto">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* 메인 이미지 영역 */}
      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
        <div className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden">
          {main?.imageUrl ? (
            <img src={main.imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-300">이미지 없음</span>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="p-4">
          {/* 상품명 */}
          <div className="text-lg font-medium mb-1">{name}</div>

          {/* 가격 (오른쪽 정렬) */}
          {price != null && (
            <div className="flex justify-end items-baseline gap-2">
              {main?.salePercent ? (
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 border border-red-200">
                  {main.salePercent}%
                </span>
              ) : null}
              {main?.salePercent ? (
                <span className="text-red-600 font-extrabold text-lg">
                  {(price * (1 - main.salePercent/100)).toLocaleString()}원
                </span>
              ) : (
                <span className="text-gray-900 font-extrabold text-lg">
                  {Number(price).toLocaleString()}원
                </span>
              )}
              {main?.salePercent ? (
                <span className="text-xs text-gray-400 line-through">
                  {Number(price).toLocaleString()}원
                </span>
              ) : null}
            </div>
          )}

          {/* 지점 단일 선택 (라디오 스타일 버튼) */}
          {Array.isArray(rows) && rows.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-500">수령 지점을 선택하세요</div>
              <div className="grid grid-cols-1 gap-2">
                {rows.map((r) => {
                  const active = String(selectedStoreId) === String(r.departmentStoreId);
                  return (
                    <button
                      key={`${r.departmentStoreId}`}
                      type="button"
                      onClick={() => setSelectedStoreId(r.departmentStoreId)}
                      className={`w-full text-left rounded-lg border px-3 py-2 transition ${active ? 'border-black ring-2 ring-black/10 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-4 w-4 rounded-full border ${active ? 'bg-black border-black' : 'border-gray-400'}`} />
                          <span className="text-sm font-medium">{r.departmentStoreName}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {/* 수량 선택 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">수량</span>
              <div className="inline-flex items-center rounded-lg border border-gray-300 overflow-hidden">
                <button type="button" onClick={dec} aria-label="수량 감소" className="px-3 py-1.5 hover:bg-gray-50">-</button>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={qty}
                  onChange={onQtyChange}
                  className="w-14 text-center outline-none py-1.5"
                />
                <button type="button" onClick={inc} aria-label="수량 증가" className="px-3 py-1.5 hover:bg-gray-50">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 여백: 고정 바와 겹침 방지 */}
      <div className="h-24" />
      
      {/* 하단 고정 버튼 바 */}
      <div
        className="fixed left-0 right-0 z-50"
        style={{ bottom: 'calc(var(--app-footer-height, 80px) + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-screen-md px-4 pb-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-2 gap-2 p-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedStoreId}
                className={`w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold active:scale-[0.99] ${!selectedStoreId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                장바구니
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedStoreId}
                className={`w-full rounded-lg bg-black py-3 text-sm font-semibold text-white active:scale-[0.99] ${!selectedStoreId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900'}`}
              >
                픽업하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 토스트 메시지 */}
      <Toast
        message="나의 장바구니에 담았어요"
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />

      {/* 매장 충돌 모달 */}
      <StoreConflictModal
        isOpen={showConflictModal}
        onClose={handleCloseConflictModal}
        productName={conflictData?.productName}
        existingStore={conflictData?.existingStore}
        newStore={conflictData?.newStore}
        existingQuantity={conflictData?.existingQuantity}
        newQuantity={conflictData?.newQuantity}
        onKeepExisting={handleKeepExisting}
        onReplaceWithNew={handleReplaceWithNew}
        canKeepExisting={conflictData?.canKeepExisting}
      />
    </main>
  );
}
