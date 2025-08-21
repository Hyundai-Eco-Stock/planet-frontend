import React, { useEffect, useMemo, useRef, useState } from "react";
import CategoryBar from "./CategoryBar";
import CategorySheet from "./CategorySheet";
import { fetchProductsByCategory } from "../../api/product/product.api";

export default function ShoppingMain() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(null); // 초기엔 선택 없음
  // 서버에서 받은 카테고리 보관
  const [categories, setCategories] = useState([]);

  // 화면 중앙에 뿌릴 데이터 상태
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // CategoryBar/Sheet가 기대하는 형태로 변환
  const barCategories = useMemo(
    () =>
      (categories || []).map((c) => ({
        key: c.categoryId,
        name: c.categoryName ?? `카테고리 ${c.categoryId}`,
        // 이미지가 있다면 CategoryBar 내부에서 처리하도록 하고, 기본 이모지는 일단 고정
        emoji: "🏷️",
        imageUrl: c.image_url || c.imageUrl || null,
        // 일부 컴포넌트가 imageUrl 대신 image 키를 참조할 수 있어 동시 제공
        image: c.image_url || c.imageUrl || null,
      })),
    [categories]
  );

  // 연속 클릭 시 이전 요청 취소용
  const pendingReq = useRef(null);

  const fetchCategory = async (key) => {
    // 이전 요청 취소
    if (pendingReq.current) pendingReq.current.abort();
    const controller = new AbortController();
    pendingReq.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProductsByCategory(key, { signal: controller.signal });
      if (Array.isArray(data)) {
        // 구형 응답: 상품 배열만 내려오는 경우
        setItems(data);
        setCategories((prev) => prev); // 유지
      } else if (data && typeof data === "object") {
        // 번들 응답: { products, categories }
        setItems(Array.isArray(data.products) ? data.products : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } else {
        setItems([]);
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "요청에 실패했어요");
    } finally {
      if (pendingReq.current === controller) pendingReq.current = null;
      setLoading(false);
    }
  };

  // 카테고리 클릭 시: 상태 변경 + API 요청
  const handleSelect = (key) => {
    setActive(key);
    setExpanded(false);
    fetchCategory(key);
  };

  // 최초 진입 시 기본 카테고리 로드
  useEffect(() => {
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <CategoryBar
        categories={barCategories}
        active={active}
        expanded={expanded}
        onSelect={handleSelect}
        onToggle={() => setExpanded((v) => !v)}
      />

      <CategorySheet
        categories={barCategories}
        active={active}
        expanded={expanded}
        onClose={() => setExpanded(false)}
        onSelect={handleSelect}
      />

      {/* 중앙 컨텐츠 */}
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
              {items.map((p, idx) => {
                const id = p.productId ?? p.product_id ?? p.id ?? idx;
                const name = p.product_name ?? p.productName ?? p.name ?? "상품명";
                const brand = p.brand_name ?? p.brandName ?? p.brand ?? "";
                const price = p.price;
                const img = p.image_url ?? p.imageUrl ?? p.thumbnail ?? p.image ?? "";
                return (
                  <li key={id} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
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
    </div>
  );
}