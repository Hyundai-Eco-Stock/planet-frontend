import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../../api/product/product.api";
import { getRaffleList } from "../../api/raffleList/raffleList.api";

const DUMMY_BANNERS = [
  "https://image.msscdn.net/display/images/2025/09/01/ca6ea88399554a8494b7c6e1782166bf.jpg",
  "https://image.msscdn.net/display/images/2025/09/01/18c20c1924bb4f24b6167fce66ac1abc.jpg",
  "https://image.msscdn.net/display/images/2025/09/01/9c9eb13992574927881841f0be0ced38.jpg",
  "https://image.msscdn.net/display/images/2025/08/29/f4ba6b9b90994dc5a35189b9dabff140.jpg",
  "https://image.msscdn.net/display/images/2025/08/29/ad8f37650a6c4294a7a1e507abe43f9c.jpg",
];

const currency = (n) => (n == null ? "" : Number(n).toLocaleString());

const Home = () => {
  // 캐러셀
  const [slide, setSlide] = useState(0);
  const total = DUMMY_BANNERS.length;
  const timerRef = useRef(null);

  useEffect(() => {
    // 3초마다 다음 슬라이드
    timerRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % total);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, [total]);

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

  // 래플 리스트
  const [raffles, setRaffles] = useState([]);
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

  const sliderStyle = useMemo(
    () => ({
      width: `${total * 100}%`,
      transform: `translateX(-${slide * (100 / total)}%)`,
      transition: "transform 500ms ease",
    }),
    [slide, total]
  );

  return (
    <div className="pb-20">
      {/* 상단 배너 캐러셀 */}
      <section className="px-3 pt-3">
        <div className="relative w-full overflow-hidden rounded-xl shadow-sm">
          <div className="flex" style={sliderStyle}>
            {DUMMY_BANNERS.map((src, idx) => (
              <div
                key={idx}
                className="flex-shrink-0"
                style={{ width: `${100 / total}%` }}
              >
                <div className="w-full aspect-square">
                  <img src={src} alt={`banner-${idx}`} className="w-full h-full object-cover" />
                </div>
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
      <section className="px-3 mt-4">
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
      <section className="px-3 mt-6 mb-6">
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold">래플 응모하기</h3>
            <span className="text-xs text-gray-500">{raffles.length}개 진행중</span>
          </div>

          <div className="space-y-3">
            {raffles.map((r) => (
              <Link
                key={r.raffleId}
                to={`/raffle/detail/${encodeURIComponent(r.raffleId)}`}
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
    </div>
  );
};

export default Home;
