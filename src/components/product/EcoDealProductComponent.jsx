import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CartIcon from '@/assets/navigation_icon/Cart.svg';

const FoodDealBadge = React.memo(() => (
  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.15)]">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
    </svg>
    푸드딜
  </span>
));

// Named export (so `import { EcoDealProductComponent } from ...` works)
export function EcoDealProductComponent({ items = [], loading = false, error = null }) {
  const navigate = useNavigate();
  
  // 에코딜 상품은 장바구니 담기 대신 바로 상세 페이지로 이동 (매장 선택 필요)
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    // 매장 선택이 필요하므로 상세 페이지로 이동
    navigate(`/eco-deal/detail?productId=${product.productId}`);
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
              const name = p.name || p.productName || "상품명";
              const brand = p.brandName;
              const price = p.price;
              const img = p.imageUrl;
              const salePercent = p.salePercent;
              
              return (
                <div key={p.productId} className="cursor-pointer">
                  {/* 이미지 부분 - 회색 테두리만 */}
                  <div 
                    className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden relative border border-gray-200 rounded-lg mb-3"
                    onClick={() => navigate(`/eco-deal/detail?productId=${p.productId}`)}
                  >
                    <FoodDealBadge />
                    {img ? (
                      <img src={img} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-300">이미지 없음</span>
                    )}
                  </div>
                  
                  {/* 정보 부분 */}
                  <div className="space-y-2">
                    {/* 장바구니 담기 버튼 - 매장 선택을 위해 상세 페이지로 이동 */}
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="w-full py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <img src={CartIcon} className="w-4 h-4" />
                      매장선택 후 담기
                    </button>
                    
                    {/* 브랜드명 / 무료배송 */}
                    <div className="text-xs font-normal text-gray-500 flex justify-between">
                      <span>픽업전용</span>
                    </div>
                    
                    {/* 상품명 */}
                    <div className="text-sm font-normal text-gray-900 line-clamp-2">
                      {name}
                    </div>
                    
                    {/* 가격 - 원래가격 → 다음줄에 할인율+할인가격 */}
                    {price != null && (
                      <div className="space-y-1">
                        {salePercent > 0 && (
                          <div className="text-gray-400 line-through text-xs">
                            {Number(price).toLocaleString()}원
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {salePercent > 0 && (
                            <span className="text-red-500 font-bold text-sm">{salePercent}%</span>
                          )}
                          <div className="text-sm font-bold text-gray-900">
                            {salePercent > 0 
                              ? Math.floor(price * (1 - salePercent / 100)).toLocaleString()
                              : Number(price).toLocaleString()
                            }원
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default EcoDealProductComponent;