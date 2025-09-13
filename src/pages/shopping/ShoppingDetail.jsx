import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchProductDetail, searchRecommendProducts } from "../../api/product/product.api";
import Toast from "@/components/common/Toast";

const MAX_INITIAL_INFO_IMAGES = 1; // 초기 노출할 상품정보 이미지 개수 (상품 더보기 버튼)

const EcoBadge = () => (
  <span className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="inline mr-1">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
    Re.Green
  </span>
);

// 배지 생성 함수 - ProductComponent와 동일
const generateBadges = (productName, price) => {
  const badgeOptions = [
    { text: 'BEST', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { text: '인기', color: 'bg-red-50 text-red-600 border-red-200' },
    { text: '추천', color: 'bg-green-50 text-green-600 border-green-200' },
    { text: 'HOT', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { text: '신상', color: 'bg-purple-50 text-purple-600 border-purple-200' }
  ];

  const hash = (productName?.length || 0) + (price || 0);
  
  // 30% 확률로 배지 표시 (ProductComponent와 동일)
  if (hash % 10 < 3) {
    const index = hash % badgeOptions.length;
    return [badgeOptions[index]]; // 단일 배지만 반환
  }
  return [];
};

// 리뷰 시스템을 더 간단하게 - productId 기반으로 일관된 데이터 생성
const generateReviews = (productId, productName) => {
  // productId를 시드로 사용해서 항상 동일한 리뷰 생성
  const seed = (productId || 0) + (productName?.length || 0);
  
  const reviewTemplates = [
    { rating: 5, text: "품질이 정말 좋고 만족스러워요!" },
    { rating: 4, text: "친환경 제품이라서 더 의미 있게 사용해요" },
    { rating: 5, text: "가격 대비 훌륭한 제품입니다. 추천해요" },
    { rating: 4, text: "배송도 빠르고 포장도 친환경적이네요" },
    { rating: 5, text: "재구매 의사 있어요. 정말 마음에 듭니다" },
    { rating: 4, text: "사용법이 간단하고 효과도 좋아요" },
    { rating: 5, text: "선물로도 좋을 것 같은 제품이에요" },
    { rating: 4, text: "생각보다 훨씬 만족스러운 품질이네요" }
  ];

  const authors = ["김**", "이**", "박**", "최**", "정**", "한**", "윤**", "조**"];
  const dates = ["2025.09.15", "2025.09.12", "2025.09.10", "2025.09.08", "2025.09.05", "2025.09.02", "2025.08.29", "2025.08.26"];

  // seed 기반으로 5-8개의 리뷰 생성
  const reviewCount = 5 + (seed % 4);
  const reviews = [];

  for (let i = 0; i < reviewCount; i++) {
    const templateIndex = (seed + i) % reviewTemplates.length;
    const authorIndex = (seed + i * 2) % authors.length;
    const dateIndex = (seed + i * 3) % dates.length;

    reviews.push({
      id: i + 1,
      rating: reviewTemplates[templateIndex].rating,
      text: reviewTemplates[templateIndex].text,
      author: authors[authorIndex],
      date: dates[dateIndex]
    });
  }

  return reviews;
};

export default function ShoppingDetail({ productId: productIdProp, onRequestNavigate, isFullScreen = false } = {}) {
  const [sp] = useSearchParams();
  const productId = productIdProp ?? sp.get("productId");
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [recommends, setRecommends] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // const { addRecentProduct } = useRecentProducts();

  // useEffect(() => {
  //   if (productData) {
  //     addRecentProduct({
  //       id: productData.id,
  //       name: productData.name,
  //       price: productData.price,
  //       image: productData.imageUrl,
  //       brand: productData.brandName
  //     });
  //   }
  // }, [productData, addRecentProduct]);

  useEffect(() => {
    if (!productId) {
      setError("상품 ID가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchProductDetail(productId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res ? [res] : []);
        setRows(list);
      })
      .catch((e) => setError(e?.message || "상세 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, [productId]);

  const infoImages = useMemo(
    () => rows
      .filter((r) => Number(r?.sortOrder) >= 1)
      .map((r) => r?.productImageUrl)
      .filter(Boolean),
    [rows]
  );
  const visibleInfoImages = useMemo(
    () => (showAllInfo ? infoImages : infoImages.slice(0, MAX_INITIAL_INFO_IMAGES)),
    [infoImages, showAllInfo]
  );
  const canCollapse = infoImages.length > MAX_INITIAL_INFO_IMAGES;
  const moreBtnAnchorId = 'product-info-more-anchor';

  const main = useMemo(() => rows[0] || null, [rows]);
  const name = main?.productName ?? "상품명";
  const brand = main?.brandName ?? "브랜드명";
  const price = main?.price;

  const reviews = useMemo(() => generateReviews(productId, name), [productId, name]);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const thumbnail = useMemo(() => {
    const zeroOrder = rows.find((r) => Number(r?.sortOrder) === 0);
    if (zeroOrder?.productImageUrl) return zeroOrder.productImageUrl;
    return main?.imageUrl || '';
  }, [rows, main]);

  // 수량 상태 및 핸들러
  const [qty, setQty] = useState(1);
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const onQtyChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQty(1);
    } else if (value > 99) {
      setQty(99);
    } else {
      setQty(value);
    }
  };

  const discountedPrice = price ? price * (1 - (main?.salePercent || 0) / 100) : 0;

  const handleBuyNow = () => {
    if (!main) return;

    const orderProduct = {
      id: main.productId,
      name: main.productName,
      price: Number(main.price ?? 0),
      quantity: Number(qty || 1),
      imageUrl: main.imageUrl || main.productImageUrl,
      isEcoDeal: Boolean(main.isEcoDeal === true || main.ecoDealStatus === 'Y'),
      ecoDealStatus: Boolean(main.isEcoDeal === true || main.ecoDealStatus === 'Y'),
      salePercent: Number(main.salePercent ?? 0),
    }

    const deliveryType = orderProduct.isEcoDeal ? 'PICKUP' : 'DELIVERY';

    navigate('/orders', {
      state: {
        products: [orderProduct],
        deliveryType: deliveryType,
        fromDirectPurchase: true
      }
    });
  };

  const handleAddToCart = () => {
    if (!main) return;
    const item = {
      id: main.productId,
      name: main.productName,
      price: Number(main.price ?? 0),
      imageUrl: thumbnail || '',
      isEcoDeal: Boolean(main.isEcoDeal === true || main.ecoDealStatus === 'Y'),
      quantity: Number(qty || 1),
      salePercent: Number(main.salePercent ?? 0),
    };

    let store;
    try {
      const raw = localStorage.getItem('cart-storage');
      store = raw ? JSON.parse(raw) : null;
    } catch (_) {
      store = null;
    }
    if (!store || typeof store !== 'object') {
      store = { state: { deliveryCart: [], pickupCart: [], selectedStore: null }, version: 0 };
    } else {
      store.state = store.state || {};
      if (!Array.isArray(store.state.deliveryCart)) store.state.deliveryCart = [];
      if (!Array.isArray(store.state.pickupCart)) store.state.pickupCart = [];
      if (typeof store.version !== 'number') store.version = 0;
    }

    const list = store.state.deliveryCart;
    const idx = list.findIndex((i) => String(i.id) === String(item.id));
    if (idx >= 0) {
      const prevQty = Number(list[idx].quantity || 0);
      list[idx] = { ...list[idx], ...item, quantity: prevQty + item.quantity };
    } else {
      list.push(item);
    }

    try {
      localStorage.setItem('cart-storage', JSON.stringify(store));
      setShowToast(true);
    } catch (e) {
      console.error('cart-storage 저장 실패', e);
      alert('장바구니 저장에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (!main) return;
    const nm = main.productName ?? "";
    const cid = main.categoryId;
    const pid = main.productId;

    const params = { name: nm, categoryId: cid, productId: pid, size: 10 };
    searchRecommendProducts(params)
      .then((list) => setRecommends(Array.isArray(list) ? list : []))
      .catch(() => setRecommends([]));
  }, [main]);

  if (loading) return <div className="flex items-center justify-center py-8"><div className="text-gray-500">불러오는 중…</div></div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!main) return <div className="p-4 text-center text-gray-500">데이터가 없습니다.</div>;

  return (
    <div className="bg-white min-h-screen">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { 
          display: -webkit-box; 
          -webkit-line-clamp: 2; 
          -webkit-box-orient: vertical; 
          overflow: hidden; 
        }
      `}</style>

      {/* 메인 이미지 영역 */}
      <div className="relative bg-gray-50 -mx-4">
        <div className="aspect-square overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
              이미지 없음
            </div>
          )}
        </div>
        
        {/* Re.Green 배지 - 상단 오른쪽 */}
        <EcoBadge />
        
        {/* 할인 배지 - Re.Green 배지 아래 */}
        {main?.salePercent > 0 && (
          <div className="absolute top-12 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {main.salePercent}%
          </div>
        )}

        {/* 일반 배지들 - 상단 왼쪽 */}
        {generateBadges(name, price).map((badge, index) => (
          <span key={index} className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
            {badge.text}
          </span>
        ))}
      </div>

      {/* 상품 기본 정보 */}
      <div className="p-4 space-y-4">
        {brand && <div className="text-sm text-gray-500">{brand}</div>}
        <h1 className="text-lg font-medium leading-tight">{name}</h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm font-semibold">{averageRating}</span>
          </div>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">리뷰 {reviews.length}건</span>
        </div>

        <div className="space-y-1">
          {main?.salePercent > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                {main.salePercent}%
              </span>
              <span className="text-gray-400 line-through text-sm">
                {Number(price).toLocaleString()}원
              </span>
            </div>
          )}
          <div className="text-2xl font-bold">
            {Math.floor(discountedPrice).toLocaleString()}원
          </div>
        </div>

        {/* 수량 선택 (배지는 이미지에서 표시) */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">수량</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={dec}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="수량 감소"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={qty}
                onChange={onQtyChange}
                className="w-12 text-center text-sm outline-none py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={inc}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10 -mx-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'info' ? 'text-black border-b-2 border-black' : 'text-gray-500'
              }`}
          >
            상품정보
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'review' ? 'text-black border-b-2 border-black' : 'text-gray-500'
              }`}
          >
            리뷰 {reviews.length}
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-4">
        {activeTab === 'info' && (
          <section className="space-y-4">
            <div className="relative">
              <div id="product-info-images" className="space-y-4">
                {visibleInfoImages.map((src, index) => (
                  <img key={`${src}-${index}`} src={src} alt="상품 정보 이미지" className="w-full rounded-lg border border-gray-100" />
                ))}
              </div>
              {canCollapse && !showAllInfo && (
                <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-28 bg-gradient-to-t from-white via-white/90 to-transparent" />
              )}
            </div>
            {canCollapse && (
              <div className="relative">
                <div id={moreBtnAnchorId} />
                <div className="-mt-8 flex justify-center">
                  <button
                    type="button"
                    aria-expanded={showAllInfo}
                    aria-controls="product-info-images"
                    onClick={() => {
                      const willExpand = !showAllInfo;
                      setShowAllInfo(willExpand);
                      if (willExpand) {
                        setTimeout(() => {
                          const el = document.getElementById(moreBtnAnchorId);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 0);
                      }
                    }}
                    className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    <span className="text-sm font-semibold">{showAllInfo ? '접기' : '상품 상세 더보기'}</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${showAllInfo ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.04 1.08l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.31a.75.75 0 01.02-1.1z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'review' && (
          <section className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{averageRating}</div>
              <div className="flex justify-center my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-500">{reviews.length}개의 리뷰</div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{review.author}</span>
                    <span className="text-sm text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 유사상품추천 */}
      <section className="p-4 bg-gray-50">
        <h2 className="font-medium mb-3">유사상품 추천</h2>
        <div className="overflow-x-scroll no-scrollbar">
          <div className="flex gap-3 pr-2">
            {recommends.map((p) => {
              const rid = p.productId;
              const rname = p.productName;
              const rimg = p.imageUrl;
              const rprice = p.price;
              return (
                <button
                  key={`${rid}-${rimg}`}
                  className="shrink-0 w-32 text-left hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (typeof onRequestNavigate === 'function') onRequestNavigate(rid);
                    else navigate(`/shopping/detail?productId=${rid}`);
                  }}
                >
                  <div className="w-32 h-32 bg-white rounded-lg overflow-hidden border border-gray-100 mb-2">
                    {rimg ? (
                      <img src={rimg} alt={rname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-gray-300 bg-gray-50">IMG</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2 mb-1" title={rname}>{rname}</div>
                  {rprice && <div className="text-sm font-medium">{Number(rprice).toLocaleString()}원</div>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 하단 여백: 고정 바와 겹침 방지 */}
      <div className="h-16" />

      {/* 하단 고정 버튼 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="max-w-screen-md mx-auto">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-50 active:scale-[0.99] transition-all"
            >
              장바구니
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-[0.99] transition-all"
            >
              바로구매
            </button>
          </div>
        </div>
      </div>

      {/* Toast 알림 */}
      <Toast
        message="나의 장바구니에 담았어요"
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}