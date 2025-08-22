import React from "react";
import { useNavigate } from "react-router-dom";

// Named export (so `import { ProductComponent } from ...` works)
export function ProductComponent({ items = [], loading = false, error = null }) {
  const navigate = useNavigate();
  return (
    // 중앙 컨텐츠
    <main className="p-4 flex justify-center">
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
                <li key={p.productId} className="rounded-xl border border-gray-100 overflow-hidden bg-white cursor-pointer" onClick={() => navigate(`/shopping/detail/productId=${p.productId}`)}>
                  <div className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden">
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