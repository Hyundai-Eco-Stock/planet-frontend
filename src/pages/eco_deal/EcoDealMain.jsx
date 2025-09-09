import React, { useEffect, useState } from "react";
import { searchTodayAllEcoDealProducts } from "../../api/product/ecoProduct.api";
import { EcoDealProductComponent } from "../../components/product/EcoDealProductComponent"

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
      {/* 상단 배너 */}
      <div className="relative -mx-4 mb-6">
        <div className="relative overflow-hidden">
          <div className="relative w-full h-[300px]">
            <img
              src="https://tohomeimage.thehyundai.com/PD/PDImages/S/6/1/2/2810000301216_80.jpg?RS=720&CS=720x480"
              alt="푸드딜 배너"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* 텍스트 오버레이 - 하단 중앙 */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white text-center px-6">
              <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-3">
                매일 저녁 6시 오픈
              </div>
              <h1 className="text-3xl font-bold mb-3 whitespace-nowrap">오늘의 푸드딜</h1>
              <p className="text-lg font-semibold mb-2 whitespace-nowrap">신선한 음식을 특가로 만나보세요</p>
              <p className="text-sm opacity-90 whitespace-nowrap">매일 새로운 상품이 준비됩니다</p>
            </div>
          </div>
        </div>
      </div>

      <EcoDealProductComponent
        items={items}
        loading={loading}
        error={error}
      />
    </div>
  );
}