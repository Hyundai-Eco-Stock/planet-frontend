import React, { useEffect, useMemo, useState } from "react";
import CategoryBar from "./CategoryBar";
import CategorySheet from "./CategorySheet";
import { fetchProductsByCategory, fetchCategories, searchProducts } from "../../api/product/product.api";
import {ProductComponent} from "../../components/product/ProductComponent";
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

  // URL 쿼리(category) 동기화용
  const [searchParams, setSearchParams] = useSearchParams();

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
    <div className="min-h-screen bg-white text-gray-900">
      <CategoryBar
        categories={barCategories}
        active={activeCategoryId}
        expanded={expanded}
        onSelect={handleSelect}
        onToggle={() => setExpanded((v) => !v)}
      />

      {/* 검색 바: CategoryBar 아래 */}
      <div className="mt-2">
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
        active={activeCategoryId}
        expanded={expanded}
        onClose={() => setExpanded(false)}
        onSelect={handleSelect}
      />

      <ProductComponent 
        items={items} 
        loading={loading} 
        error={error}
      />
    </div>
  );
}