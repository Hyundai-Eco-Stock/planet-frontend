import React, { useEffect, useMemo, useState } from "react";
import { searchTodayAllEcoDealProducts } from "../../api/product/ecoProduct.api";
import {EcoDealProductComponent} from "../../components/product/EcoDealProductComponent"

export default function EcoDealMain() {
  // 화면 중앙에 뿌릴 데이터 상태
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* 초기 렌더링: 카테고리 + 초기 상품 동시 로드 (URL의 category 우선) */
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      searchTodayAllEcoDealProducts().then((data) => (Array.isArray(data) ? data : [])),
    ])
      .then(([products]) => {
        setItems(products);
      })
      .catch((e) => {
        console.error("초기 로드 실패:", e);
        setError(e?.message || "초기 데이터 로드에 실패했어요");
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="min-h-screen bg-white text-gray-900">
      <EcoDealProductComponent 
        items={items} 
        loading={loading} 
        error={error}
      />
    </div>
  );
}