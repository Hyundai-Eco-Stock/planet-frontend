import React, { useEffect, useState } from "react";
import { searchTodayAllEcoDealProducts } from "../../api/product/ecoProduct.api";
import { EcoDealProductComponent } from "../../components/product/EcoDealProductComponent"

export default function EcoDealMain() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    searchTodayAllEcoDealProducts()
      .then((data) => {
        const products = Array.isArray(data) ? data : [];
        setAllItems(products);
        setItems(products);
        
        // 매장 목록 추출 (중복 제거)
        const uniqueStores = products.reduce((acc, product) => {
          if (product.departmentStoreId && product.departmentStoreName) {
            const existingStore = acc.find(store => store.id === product.departmentStoreId);
            if (!existingStore) {
              acc.push({
                id: product.departmentStoreId,
                name: product.departmentStoreName
              });
            }
          }
          return acc;
        }, []);
        
        setStores(uniqueStores);
      })
      .catch((e) => {
        console.error("초기 로드 실패:", e);
        setError(e?.message || "초기 데이터 로드에 실패했어요");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStoreFilter = (storeId) => {
    setSelectedStore(storeId);
    
    if (storeId === null) {
      setItems(allItems);
    } else {
      const filteredItems = allItems.filter(item => item.departmentStoreId === storeId);
      setItems(filteredItems);
    }
  };

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

            {/* 텍스트 오버레이 */}
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

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedStore ? stores.find(s => s.id === selectedStore)?.name + ' 특가 상품' : '오늘의 특가 상품'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">신선한 식품을 합리적인 가격에</p>
          </div>
          {items.length > 0 && (
            <div className="text-sm text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full">
              {items.length}개 상품
            </div>
          )}
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