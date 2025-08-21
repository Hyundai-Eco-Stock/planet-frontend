import React, { useEffect, useMemo, useRef, useState } from "react";
import CategoryBar from "./CategoryBar";
import CategorySheet from "./CategorySheet";
import { fetchProductsByCategory, fetchCategories, searchProducts } from "../../api/product/product.api";
import { useSearchParams } from "react-router-dom";

export default function ShoppingMain() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(null); // 초기엔 선택 없음
  // 서버에서 받은 카테고리 보관
  const [categories, setCategories] = useState([]);

  // 화면 중앙에 뿌릴 데이터 상태
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // URL 쿼리(category) 동기화
  const [searchParams, setSearchParams] = useSearchParams();

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

  // 서버 검색을 사용할 것이므로 클라이언트 필터링은 사용하지 않음
  const filteredItems = items;

  // 연속 클릭 시 이전 요청 취소용
  const pendingReq = useRef(null);

  // 초기 렌더링 시 카테고리 목록 로드 (/products/categories)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const json = await fetchCategories({ signal: controller.signal });
        // API 형태가 [{categoryId, categoryName, ...}] 또는 {categories: [...] } 모두 수용
        const list = Array.isArray(json) ? json : (Array.isArray(json?.categories) ? json.categories : []);
        setCategories(list ?? []);
      } catch (e) {
        // 카테고리 로드 오류는 치명적이지 않으므로 items 로딩에는 영향 X
        console.error("카테고리 로드 실패:", e);
      }
    })();
    return () => controller.abort();
  }, []);

  const fetchCategory = async (key) => {
    // 이전 요청 취소
    if (pendingReq.current) pendingReq.current.abort();
    const controller = new AbortController();
    pendingReq.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProductsByCategory(key, { signal: controller.signal });
      setItems(data);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "요청에 실패했어요");
    } finally {
      if (pendingReq.current === controller) pendingReq.current = null;
      setLoading(false);
    }
  };

  // 카테고리 클릭 시: URL만 갱신(데이터 로드는 URL 변화 감지로 처리)
  const handleSelect = (key) => {
    setActive(key);
    setExpanded(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key == null) {
        next.delete("category");
      } else {
        next.set("category", String(key));
      }
      return next;
    });
  };

  // 검색 버튼/Enter 제출: 서버에 검색 요청 → items로 매핑
  const handleSearchSubmit = async (e) => {
    e?.preventDefault?.();
    const keyword = searchKeyword.trim();
    if (!keyword) return; // 빈 검색어는 무시

    // 진행 중 요청 취소
    if (pendingReq.current) pendingReq.current.abort();
    const controller = new AbortController();
    pendingReq.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await searchProducts(keyword, { signal: controller.signal });
      // 서버 응답: List<Product>
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "검색에 실패했어요");
    } finally {
      if (pendingReq.current === controller) pendingReq.current = null;
      setLoading(false);
    }
  };

  // URL의 category 쿼리 변화에 따라 데이터 로드
  useEffect(() => {
    const urlCat = searchParams.get("category");
    if (urlCat) {
      const parsed = isNaN(Number(urlCat)) ? urlCat : Number(urlCat);
      setActive(parsed);
      fetchCategory(parsed);
    } else {
      // 파라미터가 없으면 기본 목록 로드(카테고리 고정 방지)
      fetchCategory();
      setActive(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <CategoryBar
        categories={barCategories}
        active={active}
        expanded={expanded}
        onSelect={handleSelect}
        onToggle={() => setExpanded((v) => !v)}
      />

      {/* 검색 바: CategoryBar 아래 */}
      <div className="px-4 mt-2">
        <form onSubmit={handleSearchSubmit} className="max-w-screen-md mx-auto flex gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="상품명·브랜드 검색"
            className="flex-1 h-10 rounded-md border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-md bg-gray-900 text-white"
            aria-label="검색"
          >
            검색
          </button>
        </form>
      </div>

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

          {!loading && !error && filteredItems.length === 0 && (
            <div className="h-56 flex items-center justify-center text-gray-400">표시할 상품이 없어요</div>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((p, idx) => {
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