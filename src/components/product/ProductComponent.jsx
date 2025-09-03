import React from "react";
const EcoBadge = React.memo(() => (
  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.15)]">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 3c-3.5 0-6.5 2.8-6.5 6.3 0 1.3.4 2.4 1.1 3.5C5.2 13.8 4.5 15 4.5 16.5 4.5 18.4 6.1 20 8 20h2v2h4v-2h2c1.9 0 3.5-1.6 3.5-3.5 0-1.5-.7-2.7-2.1-3.7.7-1.1 1.1-2.3 1.1-3.5C18.5 5.8 15.5 3 12 3z" fill="currentColor"/>
      <rect x="11" y="17" width="2" height="5" fill="currentColor"/>
    </svg>
    친환경
  </span>
));
import { useNavigate } from "react-router-dom";

// Named export (so `import { ProductComponent } from ...` works)
export function ProductComponent({ items = [], loading = false, error = null, onOpenDetail }) {
  const navigate = useNavigate();
  return (
    // 중앙 컨텐츠
    <main className="pt-4 flex justify-center">
      <div className="w-full max-w-screen-md">
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
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((p) => {
              const name = p.productName ?? "상품명";
              const brand = p.brandName;
              const price = p.price;
              const img = p.imageUrl;
              
              return (
                <li
                  key={p.productId}
                  className="rounded-xl border border-gray-100 overflow-hidden bg-white cursor-pointer"
                  onClick={() => {
                    if (typeof onOpenDetail === 'function') {
                      onOpenDetail(p.productId);
                      return;
                    }
                    try {
                      const y = window.scrollY || document.documentElement.scrollTop || 0;
                      sessionStorage.setItem('shopping-main-scroll', String(y));
                    } catch (_) {}
                    navigate(`/shopping/detail?productId=${p.productId}`);
                  }}
                >
                  <div className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden relative">
                    <EcoBadge />
                    {img ? (
                      <img src={img} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-300">이미지 없음</span>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-[13px] text-gray-500 line-clamp-1">{brand}</div>
                    <div className="text-sm font-medium line-clamp-2">{name}</div>
                    {price != null && (
                      <div className="mt-1 font-semibold">{Number(price).toLocaleString()}원</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

// Default export (so `import ProductComponent from ...` works)
export default ProductComponent;
