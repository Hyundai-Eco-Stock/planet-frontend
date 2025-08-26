import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchEcoDealProductDetail } from "../../api/product/ecoProduct.api";

export default function ShoppingDetail() {
  const [sp] = useSearchParams();
  const productId = sp.get("productId");
  const navigate = useNavigate();

  const [rows, setRows] = useState([]); // 상품 상세 데이터
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setError("상품 ID가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchEcoDealProductDetail(productId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res ? [res] : []);
        setRows(list);
      })
      .catch((e) => setError(e?.message || "상세 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, [productId]);

  // 메인 정보 파생
  const main = useMemo(() => rows[0] || null, [rows]);
  const name = main?.productName ?? "상품명";
  const price = main?.price;

  // 수량 상태 및 핸들러
  const [qty, setQty] = useState(1);
  const clampQty = (n) => Math.max(1, Math.min(99, Number.isNaN(n) ? 1 : n));
  const inc = () => setQty((q) => clampQty(q + 1));
  const dec = () => setQty((q) => clampQty(q - 1));
  const onQtyChange = (e) => setQty(clampQty(parseInt(e.target.value, 10)));

  // 구매/장바구니 핸들러
  const handleBuyNow = () => {
    if (!productId) return;
    if (!selectedStoreId) {
      alert('지점을 선택해주세요.');
      return;
    }
    navigate(`/cart/main?${productId}&qty=${qty}&departmentStoreId=${selectedStoreId}`);
  };

  // 장바구니 담기 (localstorage 사용)
  const handleAddToCart = () => {
    if (!main) return;
    if (!selectedStoreId) {
      alert('지점을 선택해주세요.');
      return;
    }
    const sel = rows.find(r => String(r.departmentStoreId) === String(selectedStoreId));

    // 사진과 동일한 스키마로 저장
    const item = {
      id: main.productId,
      name: main.productName,
      price: Number(main.price ?? 0),
      imageUrl: main.imageUrl || '',
      isEcoDeal: true,
      quantity: Number(qty || 1),
      salePercent: Number(main.salePercent ?? 0),
    };

    // 상태 로드/초기화
    let store;
    try {
      const raw = localStorage.getItem('shoppingState');
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

    // pickupCart 갱신(동일 id면 수량 누적)
    const list = store.state.pickupCart;
    const idx = list.findIndex((i) => String(i.id) === String(item.id));
    if (idx >= 0) {
      const prevQty = Number(list[idx].quantity || 0);
      list[idx] = { ...list[idx], ...item, quantity: prevQty + item.quantity };
    } else {
      list.push(item);
    }

    // 선택 지점 저장
    if (sel) {
      store.state.selectedStore = {
        id: sel.departmentStoreId,
        name: sel.departmentStoreName,
        address: sel.address || sel.departmentStoreAddress || '',
        phone: sel.phone || '',
        latitude: sel.lat ?? null,
        longitude: sel.lng ?? null,
      };
    }

    // 저장
    try {
      localStorage.setItem('shoppingState', JSON.stringify(store));
      alert('장바구니에 담았습니다.');
    } catch (e) {
      console.error('shoppingState 저장 실패', e);
      alert('장바구니 저장에 실패했습니다.');
    }
  };


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
          <div className="flex items-start justify-between">
            <div className="text-lg font-medium">{name}</div>
            {price != null && (
              <div className="flex items-baseline gap-2 ml-4">
                {main?.salePercent ? (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 border border-red-200">
                    {main.salePercent}%
                  </span>
                ) : null}
                {main?.salePercent ? (
                  <span className="text-red-600 font-extrabold text-lg">
                    {(price * (1 - main.salePercent/100)).toLocaleString()}원
                  </span>
                ) : (
                  <span className="text-gray-900 font-extrabold text-lg">
                    {Number(price).toLocaleString()}원
                  </span>
                )}
                {main?.salePercent ? (
                  <span className="text-xs text-gray-400 line-through">
                    {Number(price).toLocaleString()}원
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* 지점 단일 선택 (라디오 스타일 버튼) */}
          {Array.isArray(rows) && rows.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-500">수령 지점을 선택하세요</div>
              <div className="grid grid-cols-1 gap-2">
                {rows.map((r) => {
                  const active = String(selectedStoreId) === String(r.departmentStoreId);
                  return (
                    <button
                      key={`${r.departmentStoreId}`}
                      type="button"
                      onClick={() => setSelectedStoreId(r.departmentStoreId)}
                      className={`w-full text-left rounded-lg border px-3 py-2 transition ${active ? 'border-black ring-2 ring-black/10 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-4 w-4 rounded-full border ${active ? 'bg-black border-black' : 'border-gray-400'}`} />
                          <span className="text-sm font-medium">{r.departmentStoreName}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {/* 수량 선택 */}
            <div className="flex items-center gap-3">
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
      </div>
    </div>
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
                disabled={!selectedStoreId}
                className={`w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold active:scale-[0.99] ${!selectedStoreId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                장바구니
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedStoreId}
                className={`w-full rounded-lg bg-black py-3 text-sm font-semibold text-white active:scale-[0.99] ${!selectedStoreId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900'}`}
              >
                픽업하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}