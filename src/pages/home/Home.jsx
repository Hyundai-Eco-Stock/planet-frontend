import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../../api/product/product.api";
import { getRaffleList } from "../../api/raffleList/raffleList.api";

// 배너 클릭 시 이동할 상품 ID는 주석의 숫자를 반영했습니다.
const DUMMY_BANNERS = [
  {
    src: "https://image.thehyundai.com/static/7/2/6/37/A1/40A1376277_0_600.jpg",
    productId: 82,
    title: "자연 그대로의 헤어케어",
    subtitle: "수퍼 밀크 컨디셔닝 프라이머",
    brand: "LUSH",
    tag: "천연 성분"
  },
  {
    src: "https://image.thehyundai.com/static/1/6/0/40/A1/40A1400613_0_600.jpg",
    productId: 28,
    title: "지속가능한 뷰티",
    subtitle: "서멀 프로텍션 스프레이",
    brand: "BALMAIN",
    tag: "열 보호"
  },
  {
    src: "https://image.thehyundai.com/static/1/7/3/94/A0/40A0943713_0_600.jpg",
    productId: 93,
    title: "자연에서 찾은 빛",
    subtitle: "루미네센트 아이섀도 NEW",
    brand: "CHANTECAILLE",
    tag: "지속가능"
  },
  {
    src: "https://image.thehyundai.com/static/3/6/5/56/A1/40A1565634_0_600.jpg",
    productId: 112,
    title: "깨끗한 클렌징의 시작",
    subtitle: "토탈 클렌징 오일",
    brand: "CLARINS",
    tag: "친환경"
  },
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
    <div className="max-w-xl pb-4">

      {/* 상단 배너 캐러셀 */}
      <section className="relative -mx-4">
        <div className="relative overflow-hidden">
          <div
            ref={bannerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
          >
            {DUMMY_BANNERS.map((b, idx) => (
              <div key={idx} className="flex-shrink-0 min-w-full snap-start">
                <button
                  type="button"
                  onClick={() => navigate(`/shopping/detail?productId=${encodeURIComponent(b.productId)}`)}
                  className="block w-full cursor-pointer group"
                  aria-label={`배너 ${idx + 1} 이동`}
                >
                  <div className="relative w-full h-[530px]">
                    <img
                      src={b.src}
                      alt={`banner-${idx}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* 텍스트 오버레이 - 하단 중앙 */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-center">
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs mb-3">
                        {b.tag}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{b.title}</h2>
                      <p className="text-lg font-bold mb-1">{b.subtitle}</p>
                      <p className="text-sm opacity-90">{b.brand}</p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* 숫자 인디케이터 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">{slide + 1}</span>
            <span className="text-white/60 text-sm">|</span>
            <span className="text-white/60 text-sm">{total}</span>
          </div>
        </div>
      </section>

      {/* 카테고리 가로 스크롤 */}
      <section className="py-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 pb-2">
            {categories.map((c, idx) => {
              const isAll = !c?.categoryId;
              const to = c?.categoryId != null ? `/shopping/main?category=${encodeURIComponent(c.categoryId)}` : "/shopping/main";
              return (
                <Link
                  key={`${c.categoryId ?? "all"}-${idx}`}
                  to={to}
                  className="flex-shrink-0 flex flex-col items-center group"
                  aria-label={`${c.name}로 이동`}
                >
                  <div className={`w-16 h-16 rounded-full overflow-hidden border transition-all duration-200 ${isAll
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-100 border-gray-200 group-hover:border-gray-300'
                    }`}>
                    {isAll ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg font-bold">All</span>
                      </div>
                    ) : c?.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-800 text-center whitespace-nowrap">
                    {c.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 래플 섹션 */}
      <section className="mt-6 mb-6 px-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">래플 응모하기</h3>
          <span className="text-sm text-gray-500">{raffles.filter(r => !r.winnerName).length}개 진행중</span>
        </div>

        <div className="space-y-6">
          {raffles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">진행중인 래플이 없습니다</p>
            </div>
          ) : (
            raffles.map((r) => {
              const content = (
                <article className={`border border-gray-200 rounded-2xl overflow-hidden ${r.winnerName ? 'opacity-70 cursor-default' : 'cursor-pointer'
                  }`}>
                  {/* 큰 이미지 */}
                  <div className="relative h-[380px] bg-gray-100">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.productName}
                        className={`w-full h-full object-cover ${r.winnerName ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}

                    {/* 당첨자 오버레이 */}
                    {r.winnerName && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-xl font-bold mb-2">당첨자 발표</div>
                          <div className="text-lg">{r.winnerName}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 정보 섹션 */}
                  <div className="p-4 bg-white">
                    <div className="space-y-2">
                      {/* 상품명과 참여자 */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{r.productName}</h3>
                          <div className="text-sm text-gray-500 mt-1">{r.brandName}</div>
                        </div>
                        {typeof r.participateCount === "number" && (
                          <span className="text-sm text-gray-500 ml-3 whitespace-nowrap">
                            {currency(r.participateCount)}명 참여
                          </span>
                        )}
                      </div>

                      {/* 가격과 에코스톡 */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-gray-400 line-through text-sm">{currency(r.price)}원</div>
                          {r.ecoStockName && (
                            <div className="text-green-600 font-semibold text-lg">
                              {r.ecoStockName} {r.ecoStockAmount || 1}개
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 기간 */}
                      <div className="text-sm text-gray-500">{r.startDate} ~ {r.endDate}</div>
                    </div>
                  </div>
                </article>
              );

              return r.winnerName ? (
                <div key={r.raffleId}>
                  {content}
                </div>
              ) : (
                <Link
                  key={r.raffleId}
                  to={`/raffle/detail/${encodeURIComponent(r.raffleId)}`}
                  state={{ winnerName: r.winnerName }}
                  aria-label={`${r.productName} 상세 보기`}
                >
                  {content}
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* 스크림 */}
      <div
        onClick={() => setFabOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-200 ${fabOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* 개선된 플로팅 버튼 */}
      <div className="fixed right-4 bottom-28 z-[70] pointer-events-none">
        <div className="flex flex-col items-end gap-3">

          {/* 메뉴 옵션들 */}
          <div
            className={`flex flex-col items-end gap-2 transition-all duration-300 ${fabOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-2 pointer-events-none"
              }`}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-w-[120px]">
              <Link
                to="/eco-deal/main"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setFabOpen(false)}
              >
                <span className="text-base">🥗</span>
                <span>푸드딜</span>
              </Link>
              <div className="border-t border-gray-100"></div>
              <Link
                to="/raffle"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setFabOpen(false)}
              >
                <span className="text-base">🎁</span>
                <span>래플</span>
              </Link>
              <div className="border-t border-gray-100"></div>
              <Link
                to="/phti/main"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setFabOpen(false)}
              >
                <span className="text-base">🧠</span>
                <span>PHTI</span>
              </Link>
            </div>
          </div>

          {/* 메인 FAB 버튼 */}
          <button
            type="button"
            aria-label={fabOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={fabOpen}
            onClick={() => setFabOpen((v) => !v)}
            className={`pointer-events-auto w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${fabOpen
                ? "bg-gray-600 rotate-45"
                : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            <span className="text-white text-xl font-light">
              +
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;