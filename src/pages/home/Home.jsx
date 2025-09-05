import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../../api/product/product.api";
import { getRaffleList } from "../../api/raffleList/raffleList.api";

// 배너 클릭 시 이동할 상품 ID는 주석의 숫자를 반영했습니다.
const DUMMY_BANNERS = [
  { src: "https://image.thehyundai.com/static/8/5/9/26/A1/40A1269580_0_600.jpg", productId: 168 },
  { src: "https://image.thehyundai.com/static/7/2/6/37/A1/40A1376277_0_600.jpg", productId: 82 },
  { src: "https://image.thehyundai.com/static/1/8/1/67/A1/40A1671811_0_600.jpg", productId: 140 },
  { src: "https://image.thehyundai.com/static/5/9/3/56/A1/60A1563953_0_600.jpg", productId: 45 },
];

const currency = (n) => (n == null ? "" : Number(n).toLocaleString());


const Home = () => {
  const navigate = useNavigate();
  // 캐러셀
  const [slide, setSlide] = useState(0);
  const total = DUMMY_BANNERS.length;

  // 카테고리
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchCategories();
        setCategories(Array.isArray(res) ? res : res?.data ?? []);
      } catch (e) {
        console.error("fetchCategories error", e);
        setCategories([]);
      }
    })();
  }, []);

  const [raffles, setRaffles] = useState([]); // 래플 리스트
  const [fabOpen, setFabOpen] = useState(false); // 오른쪽 하단 플로팅 버튼
  useEffect(() => {
    (async () => {
      try {
        const res = await getRaffleList();
        setRaffles(Array.isArray(res) ? res : res?.data ?? []);
      } catch (e) {
        console.error("getRaffleList error", e);
        setRaffles([]);
      }
    })();
  }, []);

  const bannerRef = useRef(null);
  // 자동 슬라이드 + 스크롤 동기화
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      setSlide((s) => (s !== idx ? idx : s));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // 3초마다 다음 슬라이드로 스크롤 (현재 스크롤 위치 기준)
    const el = bannerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      const w = el.clientWidth || 0;
      const idx = Math.round((el.scrollLeft || 0) / (w || 1));
      const next = (idx + 1) % total;
      el.scrollTo({ left: w * next, behavior: 'smooth' });
      setSlide(next);
    }, 3000);
    return () => clearInterval(id);
  }, [total]);

  return (
    <div className="max-w-xl pb-20">
      {/* 상단 배너 캐러셀 */}
      <section className="pt-3">
        <div className="relative w-full overflow-hidden rounded-xl shadow-sm">
          <div
            ref={bannerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
          >
            {DUMMY_BANNERS.map((b, idx) => (
              <div key={idx} className="flex-shrink-0 min-w-full snap-start">
                <button
                  type="button"
                  onClick={() => navigate(`/shopping/detail?productId=${encodeURIComponent(b.productId)}`)}
                  className="block w-full cursor-pointer"
                  aria-label={`배너 ${idx + 1} 이동`}
                >
                  <div className="relative w-full pt-[100%]">
                    <img src={b.src} alt={`banner-${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </button>
              </div>
            ))}
          </div>
          {/* 인디케이터 */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-2 py-1 rounded-full">
            {DUMMY_BANNERS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  slide === i ? "w-4 bg-white" : "w-2 bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 그리드 */}
      <section className="mt-4">
        <div className="grid grid-cols-4 gap-y-4">
          {categories.map((c, idx) => {
            const to = c?.categoryId != null ? `/shopping/main?category=${encodeURIComponent(c.categoryId)}` : "/shopping/main";
            return (
              <Link
                key={`${c.categoryId ?? "all"}-${idx}`}
                to={to}
                className="flex flex-col items-center"
                aria-label={`${c.name}로 이동`}
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 hover:ring-2 hover:ring-gray-200 transition">
                  {c?.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">전체</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-800">{c.name}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 래플 섹션 */}
      <section className="mt-6 mb-6">
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">래플 응모하기</h3>
            <span className="text-xs text-gray-500">{raffles.length}개 진행중</span>
          </div>

          <div className="space-y-3">
            {raffles.map((r) => (
              <Link
                key={r.raffleId}
                to={`/raffle/detail/${encodeURIComponent(r.raffleId)}`}
                state={{ 
                  winnerName: r.winnerName  // 전체 래플 데이터 (winnerName 포함)
                }}
                className="block"
                aria-label={`${r.productName} 상세 보기`}
              >
                <article className="flex gap-3 rounded-lg bg-white border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                  <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.productName} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.productName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {r.brandName} · {currency(r.price)}원
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {r.startDate} ~ {r.endDate}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      {r.ecoStockName} {r.ecoStockAmount ? `+${currency(r.ecoStockAmount)} 적립` : ""}
                      {typeof r.participateCount === "number" ? ` · ${currency(r.participateCount)}명 참여` : ""}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Scrim for FAB open */}
      <div
        onClick={() => setFabOpen(false)}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${
          fabOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />


      {/* Floating Actions: 푸드딜 / 래플 (컨테이너는 pointer-events-none로 두고, 실제 요소에만 auto) */}
      <div className="fixed right-4 bottom-28 z-50 pointer-events-none">
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex flex-col items-end gap-2 transition-all duration-200 ${
              fabOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-1 pointer-events-none"
            }`}
          >
            <div className="rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
              <Link
                to="/eco-deal/main"
                className="block px-5 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-50 min-w-[140px] text-center"
              >
                푸드딜
              </Link>
              <Link
                to="/raffle"
                className="block px-5 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-50 min-w-[140px] text-center"
              >
                래플
              </Link>
              <Link
                to="/phti/survey"
                className="block px-5 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-50 min-w-[140px] text-center"
              >
                PHTI설문
              </Link>
            </div>
          </div>
          <button
            type="button"
            aria-label={fabOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={fabOpen}
            onClick={() => setFabOpen((v) => !v)}
            className="pointer-events-auto w-14 h-14 rounded-full bg-gray-900 text-white text-3xl leading-none flex items-center justify-center shadow-lg active:scale-95 transition"
          >
            {fabOpen ? "×" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
