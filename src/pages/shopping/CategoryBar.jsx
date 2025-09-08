// src/components/CategoryBar.jsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function CategoryBar({ categories, active, onSelect, expanded, onToggle }) {
  const scrollerRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const el = itemRefs.current[active];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active, categories]);

  return (
    <section className="sticky top-0 z-20 bg-white pt-2 pb-1">
      <div className="relative">
        {/* 스크롤 영역 (스크롤바 숨김) */}
        <div
          ref={scrollerRef}
          className="relative z-10 w-full overflow-x-auto overflow-y-hidden pl-2 pr-8 touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-padding-left:3rem] [scroll-padding-right:3rem]"
        >
          <div className="inline-flex gap-3 pb-2 min-w-max">
            <div aria-hidden className="shrink-0 w-12" />
            {categories.map((c) => (
              <button
                key={c.key}
                ref={(el) => (itemRefs.current[c.key] = el)}
                onClick={() => onSelect(c.key)}
                role="tab"
                aria-selected={active === c.key}
                className="relative w-[72px] flex flex-col items-center touch-pan-x select-none"
              >
                <div
                  className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 hover:ring-2 hover:ring-gray-200 transition"
                >
                  {(c.imageUrl || c.image) ? (
                    <img
                      src={c.imageUrl || c.image}
                      alt={c.name || "카테고리 이미지"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">전체</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-800 whitespace-nowrap">{c.name}</div>
                {active === c.key && (
                  <motion.div
                    layoutId="category-underline"
                    className="absolute left-2 right-2 -bottom-0.5 h-[3px] rounded bg-gray-900"
                    transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.5 }}
                  />
                )}
              </button>
            ))}
            <div aria-hidden className="shrink-0 w-12" />
          </div>
        </div>

        {/* 오른쪽 그라데이션 (이벤트 차단 방지: pointer-events-none, z-0) */}
        <div className="pointer-events-none absolute z-0 top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
