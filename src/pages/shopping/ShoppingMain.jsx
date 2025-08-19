import React, { useEffect, useMemo, useRef, useState } from "react";

const categoriesSeed = [
  { key: "home",    name: "홈",         emoji: "🏠" },
  { key: "cafe",    name: "카페·디저트", emoji: "🥤" },
  { key: "chicken", name: "치킨",       emoji: "🍗" },
  { key: "noodle",  name: "중식",       emoji: "🍜" },
  { key: "korean",  name: "한식",       emoji: "🥘" },
  { key: "fast",    name: "패스트푸드",  emoji: "🍔" },
  { key: "sushi",   name: "돈까스·회",   emoji: "🍣" },
  { key: "snack",   name: "분식",       emoji: "🌭" },
  { key: "stew",    name: "찜·탕",      emoji: "🍲" },
  { key: "pizza",   name: "피자",       emoji: "🍕" },
  { key: "pasta",   name: "양식",       emoji: "🍝" },
  { key: "meat",    name: "고기",       emoji: "🥩" },
  { key: "bento",   name: "도시락",     emoji: "🍱" },
  { key: "asian",   name: "아시안",     emoji: "🥡" },
  { key: "night",   name: "야식",       emoji: "🌙" }
];

const ShoppingMain = () => {
  const cats = useMemo(() => categoriesSeed, []);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState("cafe");
  const scrollerRef = useRef(null);
  const itemRefs = useRef({});

  const selectCat = (key) => {
    setActive(key);
    setExpanded(false);
    const el = itemRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  useEffect(() => {
    const el = itemRefs.current[active];
    if (el) el.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 상단 가로 카테고리 바 */}
      <section className="sticky top-0 z-20 bg-white pt-2 pb-1 px-3">
        <div className="relative">
          {/* 스크롤 영역 */}
          <div
            ref={scrollerRef}
            className="overflow-x-auto pr-32 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="inline-flex gap-3 pb-2">
              {cats.map((c) => (
                <button
                  key={c.key}
                  ref={(el) => (itemRefs.current[c.key] = el)}
                  onClick={() => selectCat(c.key)}
                  role="tab"
                  aria-selected={active === c.key}
                  className="relative w-[72px] flex flex-col items-center"
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl border text-[22px]
                    ${active === c.key ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                  >
                    {c.emoji}
                  </div>
                  <div className="mt-1 text-xs whitespace-nowrap">{c.name}</div>
                  {active === c.key && (
                    <div className="absolute left-2 right-2 -bottom-0.5 h-[3px] rounded bg-gray-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽 고정 그라데이션(스크롤 힌트) */}
          <div className="pointer-events-none absolute top-0 right-32 bottom-0 w-1 bg-gradient-to-l from-white to-transparent" />

          {/* 오른쪽 고정 '더보기' */}
          <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? "접기" : "더보기"}
              className="absolute right-0 inset-y-0 z-30 w-32 flex items-center justify-center bg-white"
            >
              <span className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-base">
                {expanded ? "⌃" : "⌄"}
              </span>
            </button>
        </div>
      </section>

      {/* 펼침 시트 배경 */}
      <div
        onClick={() => setExpanded(false)}
        className={`fixed inset-0 bg-black/25 transition-opacity duration-200 ${expanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* 펼침 시트(4열) */}
      <section
        role="dialog"
        aria-modal="true"
        className={`fixed left-0 right-0 top-20 z-30 rounded-t-2xl bg-white shadow-lg transition-all duration-200
        ${expanded ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"}`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-bold text-[15px]">메뉴 전체보기</span>
          <button onClick={() => setExpanded(false)} className="w-9 h-9 text-lg">⌃</button>
        </div>
        <div className="grid grid-cols-4 gap-3 p-3">
          {cats.map((c) => (
            <button
              key={`grid-${c.key}`}
              onClick={() => selectCat(c.key)}
              className="flex flex-col items-center"
            >
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-2xl border text-[22px]
                ${active === c.key ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
              >
                {c.emoji}
              </div>
              <div className="mt-1 text-sm">{c.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 데모 콘텐츠 */}
      <main className="p-4">
        <div className="h-96 rounded-xl bg-gray-50" />
      </main>
    </div>
  );
};

export default ShoppingMain;