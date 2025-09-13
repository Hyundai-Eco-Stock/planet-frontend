import React, { useEffect, useMemo, useState } from "react";
import CategoryBar from "./CategoryBar";
// import CategorySheet from "./CategorySheet";
import { fetchProductsByCategory, fetchCategories, searchProducts } from "../../api/product/product.api";
import { ProductComponent } from "../../components/product/ProductComponent";
import ShoppingDetail from "./ShoppingDetail";
import HeaderWithShoppingAndBack from "@/components/_layout/HeaderWithShoppingAndBack";
import { useSearchParams } from "react-router-dom";

export default function ShoppingMain() {
  const [expanded, setExpanded] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null); // 초기엔 선택 없음
  // 서버에서 받은 카테고리 보관
  const [categories, setCategories] = useState([]);

  // 화면 중앙에 뿌릴 데이터 상태
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  // URL 쿼리(category, detail) 동기화용
  const [searchParams, setSearchParams] = useSearchParams();
  // 상세 모달용: URL 쿼리로 스택처럼 관리
  const detailParam = searchParams.get("detail");
  const detailProductId = detailParam != null && detailParam !== "" ? Number(detailParam) : null;

  /* CategoryBar.jsx CategotySheet.jsx 데이터 맵핑 */
  const barCategories = useMemo(
    () =>
      (categories || []).map((c) => ({
        key: c.categoryId,
        name: c.name ?? `카테고리 ${c.categoryId}`,
        imageUrl: c.image_url || c.imageUrl || null
      })),
    [categories]
  );

  /* 초기 렌더링: 카테고리 + 초기 상품 동시 로드 (URL의 category 우선) */
  useEffect(() => {
    const urlCat = searchParams.get("category");
    const key = urlCat ? (isNaN(Number(urlCat)) ? urlCat : Number(urlCat)) : null;

    setActiveCategoryId(key);
    setLoading(true);
    setError(null);

    Promise.all([
      fetchCategories().then((list) => (Array.isArray(list) ? list : [])),
      fetchProductsByCategory(key).then((data) => (Array.isArray(data) ? data : [])),
    ])
      .then(([cats, products]) => {
        setCategories(cats);
        setItems(products);
      })
      .catch((e) => {
        console.error("초기 로드 실패:", e);
        setError(e?.message || "초기 데이터 로드에 실패했어요");
      })
      .finally(() => setLoading(false));
  }, []);

  // 뒤로가기 복귀 시 스크롤 위치 복원
  useEffect(() => {
    try {
      const yStr = sessionStorage.getItem('shopping-main-scroll');
      if (yStr != null) {
        const y = Number(yStr) || 0;
        // 렌더 이후에 복원 시도
        requestAnimationFrame(() => window.scrollTo(0, y));
        setTimeout(() => window.scrollTo(0, y), 0);
        sessionStorage.removeItem('shopping-main-scroll');
      }
    } catch (_) { }
  }, []);

  /* 카테고리 클릭 : URL 갱신 & 즉시 상품 목록 로드 */
  const handleSelect = async (key) => {
    const nextKey = key == null || key === "" ? null : (isNaN(Number(key)) ? key : Number(key));
    setActiveCategoryId(nextKey);
    setExpanded(false);
    setSearchParams((prev) => { // URL 동기화
      const next = new URLSearchParams(prev);
      if (nextKey == null) next.delete("category");
      else next.set("category", String(nextKey));
      return next;
    });
    setLoading(true);
    setError(null);
    try {  // 데이터 로드
      const data = await fetchProductsByCategory(nextKey ?? undefined);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "상품 목록 조회에 실패했어요");
    } finally {
      setLoading(false);
    }
  };

  /* 검색 */
  const handleSearchSubmit = async (e) => {
    e?.preventDefault?.();
    const keyword = searchKeyword.trim();
    if (!keyword) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchProducts(keyword, activeCategoryId);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "검색에 실패했어요");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl min-h-screen bg-white text-gray-900">
      {/* 고정된 카테고리 바 (헤더 높이 48px 아래) */}
      <div className="max-w-xl fixed left-1/2 -translate-x-1/2 z-40 bg-white border-b border-gray-100 px-4" style={{ top: '48px' }}>
        <CategoryBar
          categories={barCategories}
          active={activeCategoryId}
          expanded={expanded}
          onSelect={handleSelect}
          onToggle={() => setExpanded((v) => !v)}
        />
      </div>
      {/* 고정 바의 높이만큼 공간 확보 (검색 영역이 가려지지 않도록) */}
      <div className="h-[96px]" />

      {/* 검색 바 */}
      <div className="mt-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="상품명·브랜드 검색"
              className="w-full h-12 rounded-2xl border border-gray-200 px-6 pr-16 text-base bg-gray-50/50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
              aria-label="검색"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/**
       * CategorySheet 비활성화 (요청에 따라 주석 처리)
       * <CategorySheet
       *   categories={barCategories}
       *   active={activeCategoryId}
       *   expanded={expanded}
       *   onClose={() => setExpanded(false)}
       *   onSelect={handleSelect}
       * />
       */}

      <ProductComponent
        items={items}
        loading={loading}
        error={error}
        onOpenDetail={(pid) => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("detail", String(pid)); // push history with new detail
            return next;
          });
        }}
      />

      {detailProductId != null && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          {/* onBackClick 생략: 기본 navigate(-1)로 이전 상세 또는 닫기 */}
          <HeaderWithShoppingAndBack />
          <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
            <ShoppingDetail
              productId={detailProductId}
              onRequestNavigate={(pid) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("detail", String(pid)); // push another detail into history
                  return next;
                });
              }}
              isFullScreen
            />
          </main>
        </div>
      )}
    </div>
  );
}