import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchProductDetail, searchRecommendProducts } from "../../api/product/product.api";

const MAX_INITIAL_INFO_IMAGES = 1;
const formatKRW = (n) => new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(Number(n || 0));

export default function ShoppingDetail() {
  const [sp] = useSearchParams();
  const productId = sp.get("productId");
  const navigate = useNavigate();

  const [rows, setRows] = useState([]); // List<ProductDetailResponse>
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'review'
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [recommends, setRecommends] = useState([]);

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

  // 메인 정보 파생
  const main = useMemo(() => rows[0] || null, [rows]);
  // 상품정보 탭에 노출할 상세 이미지들: productImageUrl 순서 유지
  const infoImages = useMemo(() => rows.map(r => r?.productImageUrl).filter(Boolean), [rows]);

  const visibleInfoImages = useMemo(
    () => (showAllInfo ? infoImages : infoImages.slice(0, MAX_INITIAL_INFO_IMAGES)),
    [infoImages, showAllInfo]
  );

  const canCollapse = infoImages.length > MAX_INITIAL_INFO_IMAGES;
  const remainingCount = Math.max(0, infoImages.length - MAX_INITIAL_INFO_IMAGES);
  const moreBtnAnchorId = 'product-info-more-anchor';

  // 안전한 기본 정보 파생 (optional chaining 사용)
  const name = main?.productName ?? main?.name ?? "상품명";
  const brand = main?.brandName ?? main?.brand ?? "";
  const price = main?.price;

  // 추천 상품 로드: Hook은 항상 호출되며 내부에서만 조건 분기
  useEffect(() => {
    if (!main) return; // 데이터 없으면 아무 것도 하지 않음
    const nm = main.productName ?? main.name ?? "";
    const cid = main.categoryId ?? main.categoryID ?? main.category_id;
    const pid = main.productId ?? main.id;
    searchRecommendProducts(nm, cid, pid, 10)
      .then((list) => setRecommends(Array.isArray(list) ? list : []))
      .catch(() => setRecommends([]));
  }, [main]);

  // 화면 분기 (Hook 이후에 위치)
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

      {/* 이미지 영역 */}
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
            <div className="flex items-center gap-2 text-sm">
              <span>⭐</span>
              <span className="font-medium">4.59</span>
            </div>
            {price != null && (
              <div className="text-rose-500 font-extrabold text-xl">{Number(price).toLocaleString()}원</div>
            )}
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

          {/* 토글 버튼: 트렌디/가독성 향상, 남은 개수 안내 */}
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

      {/* 유사상품추천 */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">유사상품추천</h2>
        <div className="overflow-x-scroll no-scrollbar">
          <div className="flex gap-3 pr-2">
            {recommends.map((p) => {
              const rid = p.productId ?? p.id;
              const rname = p.productName ?? p.name ?? '';
              const rimg = p.imageUrl ?? p.productImageUrl;
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
                  <div className="mt-2 text-sm line-clamp-2">{rname}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}