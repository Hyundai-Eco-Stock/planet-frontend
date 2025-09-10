import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchEcoDealProductDetail } from "../../api/product/ecoProduct.api";
import Toast from "@/components/common/Toast";
import StoreConflictModal from "@/components/eco-deal/StoreConflictModal";
import useCartStore from "@/store/cartStore";

const FoodDealBadge = React.memo(() => (
  <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.15)]">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
    </svg>
    푸드딜
  </span>
));

// 에코딜(음식) 전용 배지 생성 함수
const generateFoodBadges = (productName) => {
  const badgeOptions = [
    { text: '품질보장', color: 'bg-blue-50 text-blue-600' },
    { text: '한정수량', color: 'bg-red-50 text-red-600' },
    { text: '엄선상품', color: 'bg-indigo-50 text-indigo-600' },
    { text: '프리미엄', color: 'bg-amber-50 text-amber-600' }
  ];
  
  const hash = productName?.length || 0;
  const selectedBadges = [];
  
  // 최대 2개의 배지만 선택
  const badgeCount = 1 + (hash % 2); // 1-2개
  for (let i = 0; i < badgeCount; i++) {
    const index = (hash + i) % badgeOptions.length;
    if (!selectedBadges.find(b => b.text === badgeOptions[index].text)) {
      selectedBadges.push(badgeOptions[index]);
    }
  }
  
  return selectedBadges;
};

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
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const onQtyChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQty(1);
    } else if (value > 99) {
      setQty(99);
    } else {
      setQty(value);
    }
  };

  // 계산된 값들
  const discountedPrice = price ? price * (1 - (main?.salePercent || 0) / 100) : 0;

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

  if (loading) return <div className="flex items-center justify-center py-8"><div className="text-gray-500">불러오는 중…</div></div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!main) return <div className="p-4 text-center text-gray-500">데이터가 없습니다.</div>;

  return (
    <div className="bg-white">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 메인 이미지 영역 - 화면 꽉 채우기 */}
      <div className="relative bg-gray-50 -mx-4">
        <div className="aspect-square overflow-hidden">
          {main?.imageUrl ? (
            <img src={main.imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
              이미지 없음
            </div>
          )}
        </div>

        {/* 푸드딜 배지 */}
        <FoodDealBadge />
      </div>

      {/* 상품 기본 정보 */}
      <div className="p-4 space-y-4">
        {/* 상품명 */}
        <h1 className="text-lg font-medium leading-tight">{name}</h1>

        {/* 가격 - 일반 상품과 동일한 배치 */}
        <div className="space-y-1">
          {main?.salePercent > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                {main.salePercent}%
              </span>
              <span className="text-gray-400 line-through text-sm">
                {Number(price).toLocaleString()}원
              </span>
            </div>
          )}
          <div className="text-2xl font-bold">
            {Math.floor(discountedPrice).toLocaleString()}원
          </div>
        </div>

        {/* 배지들 + 수량 선택 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {generateFoodBadges(name).map((badge, index) => (
            <span key={index} className={`${badge.color} px-2 py-1 rounded text-xs font-medium`}>
              {badge.text}
            </span>
          ))}
        </div>
        
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">수량</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={dec}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="수량 감소"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={qty}
                onChange={onQtyChange}
                className="w-12 text-center text-sm outline-none py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={inc}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>
          </div>
      </div>

        {/* 지점 선택 (라디오 스타일 버튼) */}
        {Array.isArray(rows) && rows.length > 0 && (
          <div className="space-y-2">
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
      </div>

      {/* 하단 여백: 고정 바와 겹침 방지 */}
      <div className="h-16" />

      {/* 하단 고정 버튼 바 - 일반 상품과 동일하게 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="max-w-screen-md mx-auto">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedStoreId}
              className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-50 active:scale-[0.99] transition-all"
            >
              장바구니
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!selectedStoreId}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-[0.99] transition-all"
            >
              픽업하기
            </button>
          </div>
        </div>
      </div>

      {/* 토스트 메시지 */}
      <Toast
        message="나의 장바구니에 담았어요"
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
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
    </div>
  );
}