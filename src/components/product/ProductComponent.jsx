import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CartIcon from '@/assets/navigation_icon/Cart.svg';
import Toast from "@/components/common/Toast";

const EcoBadge = React.memo(() => (
  <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
    Re.Green
  </span>
));

// 배지 생성 함수
const generateProductBadges = (productName, price) => {
  const badgeOptions = [
    { text: 'BEST', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { text: '인기', color: 'bg-red-50 text-red-600 border-red-200' },
    { text: '추천', color: 'bg-green-50 text-green-600 border-green-200' },
    { text: 'HOT', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { text: '신상', color: 'bg-purple-50 text-purple-600 border-purple-200' }
  ];

  const hash = (productName?.length || 0) + (price || 0);
  
  if (hash % 10 < 3) {
    const index = hash % badgeOptions.length;
    return badgeOptions[index];
  }
  return null;
};


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

  const handleProductClick = (productId) => {
    if (typeof onOpenDetail === 'function') {
      onOpenDetail(productId);
      return;
    }
    try {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      sessionStorage.setItem('shopping-main-scroll', String(y));
    } catch (_) { }
    navigate(`/shopping/detail?productId=${productId}`);
  };

  return (
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
              const salePercent = p.salePercent || 0;
              const discountedPrice = price ? price * (1 - salePercent / 100) : 0;
              const img = p.imageUrl;
              const badge = generateProductBadges(name, price);

              return (
                <div key={p.productId} className="group">
                  {/* 이미지 부분 */}
                  <div
                    className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden relative border border-gray-200 rounded-xl mb-3 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-gray-300"
                    onClick={() => handleProductClick(p.productId)}
                  >
                    <EcoBadge />
                    
                    {/* 할인 배지 */}
                    {salePercent > 0 && (
                      <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {salePercent}%
                      </div>
                    )}
                    
                    {/* 상품 배지 */}
                    {badge && (
  <div className={`absolute ${salePercent > 0 ? 'top-12' : 'top-2'} left-2 z-10 px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
    {badge.text}
  </div>
)}

                    {img ? (
                      <img 
                        src={img} 
                        alt={name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <span className="text-gray-300">이미지 없음</span>
                    )}
                  </div>

                  {/* 정보 부분 */}
                  <div className="space-y-2">
                    {/* 브랜드명 */}
                    <div className="text-xs text-gray-500 font-medium">{brand || "브랜드명"}</div>

                    {/* 상품명 */}
                    <div 
                      className="text-sm font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-gray-700 transition-colors"
                      onClick={() => handleProductClick(p.productId)}
                    >
                      {name}
                    </div>

                    {/* 가격 */}
                    <div className="space-y-1">
                      {salePercent > 0 ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 line-through">
                            {Number(price).toLocaleString()}원
                          </div>
                          <div className="text-base font-bold text-black">
                            {Math.floor(discountedPrice).toLocaleString()}원
                          </div>
                        </div>
                      ) : price != null ? (
                        <div className="text-base font-bold text-black">
                          {Number(price).toLocaleString()}원
                        </div>
                      ) : null}
                    </div>

                    {/* 장바구니 담기 버튼 */}
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="w-full py-2.5 text-sm font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl border-0 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-sm active:scale-[0.98]"
                    >
                      <img src={CartIcon} className="w-4 h-4" />
                      담기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast 알림 */}
      <Toast
        message="나의 장바구니에 담았어요"
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </main>
  );
}

export default ProductComponent;