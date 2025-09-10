import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CartIcon from '@/assets/navigation_icon/Cart.svg';

const generateFoodBadges = (productName, price) => {
  const badgeOptions = [
    { text: '품질보장', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { text: '한정수량', color: 'bg-red-50 text-red-600 border-red-200' },
    { text: '엄선상품', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { text: '프리미엄', color: 'bg-amber-50 text-amber-600 border-amber-200' }
  ];
  
  const hash = (productName?.length || 0) + (price || 0);
  
  // 60% 확률로 배지 표시
  if (hash % 10 < 6) {
    const index = hash % badgeOptions.length;
    return badgeOptions[index];
  }
  return null;
};

export function EcoDealProductComponent({ items = [], loading = false, error = null }) {
  const navigate = useNavigate();
  
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    navigate(`/eco-deal/detail?productId=${product.productId}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/eco-deal/detail?productId=${productId}`);
  };
  
  return (
    <main className="pt-4">
      <div className="w-full max-w-screen-md mx-auto">
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
              const salePercent = p.salePercent || 0;
              const discountedPrice = price ? price * (1 - salePercent / 100) : 0;
              const img = p.imageUrl;
              const badge = generateFoodBadges(name, price);
              
              return (
                <div key={p.productId} className="group">
                  {/* 이미지 부분 */}
                  <div 
                    className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden relative border border-gray-200 rounded-xl mb-3 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-gray-300"
                    onClick={() => handleProductClick(p.productId)}
                  >
                    {/* 상품 배지 */}
                    {badge && (
                      <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                        {badge.text}
                      </div>
                    )}
                    
                    {/* 할인 배지 */}
                    {salePercent > 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {salePercent}%
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
                    <div className="text-xs text-gray-500 font-medium">픽업전용</div>

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

                    {/* 매장 선택 버튼 */}
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="w-full py-2.5 text-sm font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl border-0 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-sm active:scale-[0.98]"
                    >
                      <img src={CartIcon} className="w-4 h-4" />
                      매장 선택 후 담기
                    </button>
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