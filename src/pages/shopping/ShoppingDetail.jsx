import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchProductDetail, searchRecommendProducts } from "../../api/product/product.api";
import Toast from "@/components/common/Toast";

const MAX_INITIAL_INFO_IMAGES = 1; // 초기 노출할 상품정보 이미지 개수 (상품 더보기 버튼)

export default function ShoppingDetail() {
  const [sp] = useSearchParams();
  const productId = sp.get("productId");
  const navigate = useNavigate();

  const [rows, setRows] = useState([]); // 상품 상세 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // 상품정보, 리뷰 탭
  const [showAllInfo, setShowAllInfo] = useState(false); // 상품정보 이미지 전체 보기 여부
  const [recommends, setRecommends] = useState([]); // 유사상품추천 목록

  const [showToast, setShowToast] = useState(false);

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

  // 상품정보 탭에 노출할 상세 이미지들
  const infoImages = useMemo(() => rows.map(r => r?.productImageUrl).filter(Boolean), [rows]);
  const visibleInfoImages = useMemo(
    () => (showAllInfo ? infoImages : infoImages.slice(0, MAX_INITIAL_INFO_IMAGES)),
    [infoImages, showAllInfo]
  );
  const canCollapse = infoImages.length > MAX_INITIAL_INFO_IMAGES;
  const moreBtnAnchorId = 'product-info-more-anchor';

  // 메인 정보 파생
  const main = useMemo(() => rows[0] || null, [rows]);
  const name = main?.productName ?? "상품명";
  const brand = main?.brandName ?? "브랜드명";
  const price = main?.price;

  // 수량 상태 및 핸들러
  const [qty, setQty] = useState(1);
  const inc = () => setQty((q) => q+1);
  const dec = () => setQty((q) => q-1);
  const onQtyChange = (e) => setQty(parseInt(e.target.value, 10));

  // 구매/장바구니 핸들러
  const handleBuyNow = () => {
    if (!main) return;

    // 상품 정보를 주문서 형식으로 변환
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

    // 에코딜 상품인지 확인하여 배송 타입 결정
    const deliveryType = orderProduct.isEcoDeal ? 'PICKUP' : 'DELIVERY';

    navigate('/orders', { 
      state: { 
        products: [orderProduct], 
        deliveryType: deliveryType,
        fromDirectPurchase: true // 바로 구매인지 구분하기 위한 플래그
      } 
    });
  };

  // 장바구니 담기 (localstorage 사용)
  const handleAddToCart = () => {
    if (!main) return;
    const item = {
      id: main.productId,
      name: main.productName,
      price: Number(main.price ?? 0),
      imageUrl: main.imageUrl || main.productImageUrl || '',
      isEcoDeal: Boolean(main.isEcoDeal === true || main.ecoDealStatus === 'Y'),
      quantity: Number(qty || 1),
      salePercent: Number(main.salePercent ?? 0),
    };

    // 상태 로드/초기화
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

    // deliveryCart 갱신(동일 id면 수량 누적 및 최신 정보 반영)
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
    // 유사상품 추천
    searchRecommendProducts(params)
      .then((list) => setRecommends(Array.isArray(list) ? list : []))
      .catch(() => setRecommends([]));
  }, [main]);

  if (loading) return <div className="p-4">불러오는 중…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!main) return <div className="p-4">데이터가 없습니다.</div>;

  return (
    <main className="p-4 max-w-screen-md mx-auto">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="flex items-center mb-3">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 text-gray-600 hover:text-black"
          aria-label="뒤로가기"
        >←</button>
      </div>

      {/* 메인 이미지 영역 */}
      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
        <div className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden">
          {main?.imageUrl ? (
            <img src={main.imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-300">이미지 없음</span>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="p-4">
          {brand && <div className="text-sm text-gray-500 mb-1">{brand}</div>}
          <div className="text-lg font-medium">{name}</div>
          <div className="mt-2 flex items-center justify-between">
            {/* <div className="flex items-center gap-2 text-sm">
              <span>⭐</span>
              <span className="font-medium">4.59</span>
            </div> */}
            {price != null && (
              <div className="text-rose-500 font-extrabold text-xl">{Number(price).toLocaleString()}원</div>
            )}
            {/* 수량 선택 */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-500">수량</span>
              <div className="inline-flex items-center rounded-lg border border-gray-300 overflow-hidden">
                <button type="button" onClick={dec} aria-label="수량 감소" className="px-3 py-1.5 hover:bg-gray-50">-</button>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={qty}
                  onChange={onQtyChange}
                  className="w-14 text-center outline-none py-1.5"
                />
                <button type="button" onClick={inc} aria-label="수량 증가" className="px-3 py-1.5 hover:bg-gray-50">+</button>
              </div>
            </div>
          </div>

      {/* 탭 바 */}
      <div className="mt-6 border-b grid grid-cols-2 w-full">
        <button
          className={`w-full pb-3 text-base text-center ${activeTab === 'info' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('info')}
        >
          상품 정보
        </button>
        <button
          className={`w-full pb-3 text-base text-center ${activeTab === 'review' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('review')}
        >
          리뷰
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'info' && (
        <section className="mt-4">
          <div className="relative">
            <div id="product-info-images" className="space-y-4">
              {visibleInfoImages.map((src) => (
                <img key={src} src={src} alt="상품 정보 이미지" className="w-full rounded-lg border border-gray-100" />
              ))}
            </div>
            {canCollapse && !showAllInfo && (
              <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-28 bg-gradient-to-t from-white via-white/90 to-transparent" />
            )}
          </div>
          {canCollapse && (
            <div className="relative">
              {/* 앵커: 펼치기 후 스크롤 포커스 */}
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
                      // 펼칠 때 버튼 위치가 가려지지 않도록 부드럽게 스크롤
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
        <section className="mt-4" />
      )}
      </div>
    </div>
      {/* 유사상품추천 */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">유사상품추천</h2>
        <div className="overflow-x-scroll no-scrollbar">
          <div className="flex gap-3 pr-2">
            {recommends.map((p) => {
              const rid = p.productId;
              const rname = p.productName;
              const rimg = p.imageUrl;
              return (
                <button
                  key={`${rid}-${rimg}`}
                  className="shrink-0 w-36 text-left"
                  onClick={() => navigate(`/shopping/detail?productId=${rid}`)}
                >
                  <div className="w-36 h-36 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    {rimg ? (
                      <img src={rimg} alt={rname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-gray-300">IMG</div>
                    )}
                  </div>
                  <div className="mt-2 text-sm truncate" title={rname}>{rname}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 하단 여백: 고정 바와 겹침 방지 */}
      <div className="h-24" />

      {/* 하단 고정 버튼 바 */}
      <div
        className="fixed left-0 right-0 z-50"
        style={{ bottom: 'calc(var(--app-footer-height, 80px) + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-screen-md px-4 pb-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-2 gap-2 p-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99]"
              >
                장바구니
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-900 active:scale-[0.99]"
              >
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>

      { /* Toast 알ㄹ미 */ }
      <Toast
        message="나의 장바구니에 담았어요"
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}  
      />
    </main>
  );
}