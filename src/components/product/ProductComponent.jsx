import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CartIcon from '@/assets/navigation_icon/Cart.svg';
import Toast from "@/components/common/Toast";

const EcoBadge = React.memo(() => (
  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none bg-emerald-50 text-emerald-700 border border-emerald-200">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
    Re.Green
  </span>
));

// Named export (so `import { ProductComponent } from ...` works)
export function ProductComponent({ items = [], loading = false, error = null, onOpenDetail }) {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    const item = {
      id: product.productId,
      name: product.productName,
      price: Number(product.price ?? 0),
      imageUrl: product.imageUrl || '',
      isEcoDeal: Boolean(product.isEcoDeal === true || product.ecoDealStatus === 'Y'),
      quantity: 1,
      salePercent: Number(product.salePercent ?? 0),
    };

    // 상태 로드/초기화 (ShoppingDetail과 동일한 방식)
    let store;
    try {
      const raw = localStorage.getItem('cart-storage');
      store = raw ? JSON.parse(raw) : null;
    } catch (_) {
      store = null;
    }
    if (!store || typeof store !== 'object') {
      store = { state: { deliveryCart: [], pickupCart: [], selectedStore: null }, version: 0 };
    } else {
      store.state = store.state || {};
      if (!Array.isArray(store.state.deliveryCart)) store.state.deliveryCart = [];
      if (!Array.isArray(store.state.pickupCart)) store.state.pickupCart = [];
      if (typeof store.version !== 'number') store.version = 0;
    }

    // deliveryCart 갱신(동일 id면 수량 누적 및 최신 정보 반영) - ShoppingDetail과 동일
    const list = store.state.deliveryCart;
    const idx = list.findIndex((i) => String(i.id) === String(item.id));
    if (idx >= 0) {
      const prevQty = Number(list[idx].quantity || 0);
      list[idx] = { ...list[idx], ...item, quantity: prevQty + item.quantity };
    } else {
      list.push(item);
    }

    try {
      localStorage.setItem('cart-storage', JSON.stringify(store));
      setShowToast(true);
    } catch (e) {
      console.error('cart-storage 저장 실패', e);
      alert('장바구니 저장에 실패했습니다.');
    }
  };

  return (
    // 중앙 컨텐츠
    <main className="pt-4">
      <div className="w-full max-w-screen-md mx-auto">
        {/* 상태 표시 */}
        {loading && (
          <div className="h-56 flex items-center justify-center text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            불러오는 중…
          </div>
        )}

        {!loading && error && (
          <div className="h-56 flex items-center justify-center text-red-500">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="h-56 flex items-center justify-center text-gray-400">표시할 상품이 없어요</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {items.map((p) => {
              const name = p.productName ?? "상품명";
              const brand = p.brandName;
              const price = p.price;
              const img = p.imageUrl;

              return (
                <div key={p.productId} className="cursor-pointer">
                  {/* 이미지 부분 - 회색 테두리만 */}
                  <div
                    className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden relative border border-gray-200 rounded-lg mb-2"
                    onClick={() => {
                      if (typeof onOpenDetail === 'function') {
                        onOpenDetail(p.productId);
                        return;
                      }
                      try {
                        const y = window.scrollY || document.documentElement.scrollTop || 0;
                        sessionStorage.setItem('shopping-main-scroll', String(y));
                      } catch (_) { }
                      navigate(`/shopping/detail?productId=${p.productId}`);
                    }}
                  >
                    <EcoBadge />
                    {img ? (
                      <img src={img} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-300">이미지 없음</span>
                    )}
                  </div>

                  {/* 정보 부분 */}
                  <div className="space-y-2">
                    {/* 장바구니 담기 버튼 */}
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="w-full py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <img src={CartIcon} className="w-4 h-4" />
                      담기
                    </button>

                    {/* 브랜드명 / 무료배송 */}
                    <div className="text-xs font-normal text-gray-500 flex justify-between">
                      <span>{brand || "브랜드명"}</span>
                      <span>무료배송</span>
                    </div>

                    {/* 상품명 */}
                    <div className="text-sm font-normal text-gray-900 line-clamp-2">
                      {name}
                    </div>

                    {/* 가격 */}
                    {price != null && (
                      <div className="text-sm font-bold text-gray-900">
                        {Number(price).toLocaleString()}원
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      { /* Toast 알ㄹ미 */}
      <Toast
        message="나의 장바구니에 담았어요"
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </main>
  );
}

// Default export (so `import ProductComponent from ...` works)
export default ProductComponent;
