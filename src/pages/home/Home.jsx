import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../../api/product/product.api";
import { getRaffleList } from "../../api/raffleList/raffleList.api";
import { searchTodayAllEcoDealProducts } from "../../api/product/ecoProduct.api";
import heendyEarth from '@/assets/heendy-earth.png'

// 배너 클릭 시 이동할 상품 ID는 주석의 숫자를 반영했습니다.
const DUMMY_BANNERS = [
  {
    src: "https://image.thehyundai.com/static/7/2/6/37/A1/40A1376277_0_600.jpg",
    productId: 82,
    title: "자연 그대로의 헤어 케어",
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

// 진행중인 래플 필터링 함수
const getActiveRaffles = (raffles) => {
  const now = new Date();
  return raffles.filter(raffle => {
    if (raffle.winnerName) return false; // 이미 당첨자가 있으면 제외

    if (raffle.endDate) {
      // endDate가 "YYYY-MM-DD" 형식이라면 시간을 23:59:59로 설정
      let endDateTime;
      if (raffle.endDate.includes(' ')) {
        // 이미 시간이 포함된 경우
        endDateTime = new Date(raffle.endDate);
      } else {
        // 날짜만 있는 경우 해당 날짜의 마지막 시간으로 설정
        endDateTime = new Date(raffle.endDate + ' 23:59:59');
      }

      return endDateTime > now; // 현재 시간보다 미래인 것만
    }
    return true; // endDate가 없으면 일단 포함
  });
};

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

  const [, setRaffles] = useState([]);
  const [activeRaffles, setActiveRaffles] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRaffleList();
        const raffleData = Array.isArray(res) ? res : res?.data ?? [];
        setRaffles(raffleData);
        setActiveRaffles(getActiveRaffles(raffleData));
      } catch (e) {
        console.error("getRaffleList error", e);
        setRaffles([]);
        setActiveRaffles([]);
      }
    })();
  }, []);

  // 푸드딜 상품
  const [foodDeals, setFoodDeals] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await searchTodayAllEcoDealProducts();
        const foodDealData = Array.isArray(res) ? res.slice(0, 4) : [];
        setFoodDeals(foodDealData);
      } catch (e) {
        console.error("searchTodayAllEcoDealProducts error", e);
        setFoodDeals([]);
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
    <div className="max-w-xl bg-white min-h-screen">

      {/* 상단 배너 캐러셀 */}
      <section className="relative -mx-4 mb-6">
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
                  <div className="relative w-full h-[400px]">
                    <img
                      src={b.src}
                      alt={`banner-${idx}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    <div className="absolute bottom-16 left-4 right-4 text-white">
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                        {b.tag}
                      </div>
                      <h2 className="text-xl font-bold mb-2">{b.title}</h2>
                      <p className="text-sm opacity-90 mb-1">{b.subtitle}</p>
                      <p className="text-xs opacity-75">{b.brand}</p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">{slide + 1}</span>
            <span className="text-white/60 text-sm">|</span>
            <span className="text-white/60 text-sm">{total}</span>
          </div>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="px-4 mb-6">
        <h3 className="text-lg font-bold text-black mb-4">카테고리</h3>
        <div className="overflow-x-auto scrollbar-hide -mx-4">
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
                    : 'bg-white border-gray-200 group-hover:border-gray-300 shadow-sm'
                    }`}>
                    {isAll ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold">All</span>
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
                  <div className="mt-2 text-xs text-black text-center whitespace-nowrap font-medium">
                    {c.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2x2 기능 그리드 */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/eco-deal/main"
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/40 rounded-xl p-4 text-emerald-700 hover:scale-105 hover:bg-white/80 transition-all duration-200 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-xl mb-1">🍽️</div>
                <div className="text-sm font-bold mb-1">푸드딜</div>
                <div className="text-xs opacity-80">오늘의 특가</div>
              </div>
            </div>
          </Link>

          <Link
            to="/shopping/main"
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/40 rounded-xl p-4 text-blue-700 hover:scale-105 hover:bg-white/80 transition-all duration-200 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-xl mb-1">🛍️</div>
                <div className="text-sm font-bold mb-1">쇼핑하기</div>
                <div className="text-xs opacity-80">친환경 프리미엄 상품</div>
              </div>
            </div>
          </Link>

          <Link
            to="/raffle"
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-sm border border-orange-200/40 rounded-xl p-4 text-orange-700 hover:scale-105 hover:bg-white/80 transition-all duration-200 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-xl mb-1">🎁</div>
                <div className="text-sm font-bold mb-1">래플 참여</div>
                <div className="text-xs opacity-80">진행 중인 래플 {activeRaffles.length}개</div>
              </div>
            </div>
          </Link>

          <Link
            to="/phti/main"
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-sm border border-purple-200/40 rounded-xl p-4 text-purple-700 hover:scale-105 hover:bg-white/80 transition-all duration-200 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-xl mb-1">🧠</div>
                <div className="text-sm font-bold mb-1">PHTI</div>
                <div className="text-xs opacity-80">성향 테스트</div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 푸드딜 */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">오늘의 푸드딜</h3>
          <Link to="/eco-deal/main" className="text-sm text-gray-600 hover:text-black">
            더보기
          </Link>
        </div>

        {foodDeals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-400">오늘의 푸드딜이 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide -mx-4">
            <div className="flex gap-3 px-4 pb-2">
              {foodDeals.map((deal) => {
                const originalPrice = deal.price || 0;
                const discountedPrice = originalPrice * (1 - (deal.salePercent || 0) / 100);
                const discountRate = deal.salePercent || 0;
                const productName = deal.productName || deal.name || deal.title || '상품명 없음';

                return (
                  <Link
                    key={deal.productId || deal.id}
                    to={`/eco-deal/detail?productId=${encodeURIComponent(deal.productId || deal.id)}`}
                    className="flex-shrink-0 w-48 bg-white rounded-xl overflow-hidden hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      {deal.imageUrl ? (
                        <img
                          src={deal.imageUrl}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )}
                      {discountRate > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {discountRate}% 할인
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-black mb-2 line-clamp-2">{productName}</h4>
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-bold text-black">{currency(Math.floor(discountedPrice))}원</span>
                        {discountRate > 0 && (
                          <span className="text-xs text-gray-400 line-through">{currency(originalPrice)}원</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 래플 */}
      <section className="px-4 mb-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-black">래플 응모하기</h3>
            <div className="relative group">
              <div className="w-4 h-4 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-bold cursor-help transition-colors">
                ?
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  래플은 추첨을 통해 상품을 받는 이벤트예요<br />
                  래플별 필요한 에코스톡으로 무료 응모 가능!
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
          <span className="text-sm text-gray-500">{activeRaffles.length}개 진행중</span>
        </div>

        {activeRaffles.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <div className="text-4xl mb-3">🎁</div>
            <p className="text-gray-400">진행중인 래플이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRaffles.slice(0, 3).map((r) => (
              <Link
                key={r.raffleId}
                to={`/raffle/detail/${encodeURIComponent(r.raffleId)}`}
                state={{ winnerName: r.winnerName }}
                aria-label={`${r.productName} 상세 보기`}
                className="block bg-white rounded-2xl overflow-hidden hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="flex h-36">
                  <div className="w-36 h-full bg-gray-100 flex-shrink-0 relative overflow-hidden">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}

                    {/* 참여자 수 배지 */}
                    {typeof r.participateCount === "number" && (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                        {currency(r.participateCount)}명
                      </div>
                    )}
                  </div>

                  {/* 내용 영역 */}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-black truncate mb-1">{r.productName}</h4>
                          <div className="text-sm text-gray-500">{r.brandName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* 가격 정보 */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 line-through">{currency(r.price)}원</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-black text-red-500">0원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* 더보기 버튼 */}
            <Link
              to="/raffle"
              className="block text-center py-3 text-gray-600 hover:text-black border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {activeRaffles.length > 3 ? `래플 전체보기 (${activeRaffles.length}개)` : '래플 전체보기'}
            </Link>
          </div>
        )}
      </section>

      {/* 에코스톡 */}
      <section className="px-4 mb-6">
        <Link
          to="/eco-stock/main"
          className="block relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-400 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white/70 backdrop-blur-sm border border-green-200/40 rounded-2xl p-4 hover:scale-[1.02] hover:bg-white/80 transition-all duration-200 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-100/30 rounded-2xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1 text-green-800">에코스톡</h3>
                <p className="text-sm text-green-700/80">환경 가치를 투자로 연결하세요</p>
              </div>
              <div className="w-12 h-12 bg-green-400/20 backdrop-blur-sm border border-green-300/30 rounded-full flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* 브랜드 스토리 */}
      <section className="-mx-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 text-center">
          <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <img
              src={heendyEarth}
              alt="흰디 지구"
              className="w-full h-full object-contain"
            />
          </div>

          <h3 className="text-lg font-bold text-black mb-2">지구를 지키는 흰디와 함께</h3>
          <p className="text-sm text-gray-600 mb-4">
            ESG 가치를 실천하는 쇼핑으로 더 나은 내일을 만들어가요
          </p>

          <Link
            to="/about"
            className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            브랜드 스토리
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;