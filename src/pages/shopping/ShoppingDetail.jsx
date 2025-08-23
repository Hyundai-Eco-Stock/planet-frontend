import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchProductDetail } from "../../api/product/product.api";

export default function ShoppingDetail() {
  const [sp] = useSearchParams();
  const productId = sp.get("productId");
  const navigate = useNavigate();

  const [rows, setRows] = useState([]); // List<ProductDetailResponse>
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'review'

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

  if (loading) return <div className="p-4">불러오는 중…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!main) return <div className="p-4">데이터가 없습니다.</div>;

  const name = main.productName ?? main.name ?? "상품명";
  const brand = main.brandName ?? main.brand ?? "";
  const price = main.price;

  return (
    <main className="p-4 max-w-screen-md mx-auto">
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
        <section className="mt-4 space-y-4">
          {infoImages.map((src) => (
            <img key={src} src={src} alt="상품 정보 이미지" className="w-full rounded-lg border border-gray-100" />
          ))}
        </section>
      )}
      {activeTab === 'review' && (
        <section className="mt-4" />
      )}
      </div>

      {/* 추가 섹션: 같은 응답 리스트에서 다른 정보가 있다면 여기에 확장 가능 */}
      {/* 예: 옵션/이미지 묶음/연관 상품 등 */}
    </main>
  );
}