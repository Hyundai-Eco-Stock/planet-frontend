// src/components/CategoryBar.jsx
import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

export default function CategoryBar({ categories, active, onSelect, expanded, onToggle }) {
  const scrollerRef = useRef(null);
  const itemRefs = useRef({});

  // 스크롤 이벤트 최적화
  useEffect(() => {
    const el = itemRefs.current[active];
    if (el && scrollerRef.current) {
      // 불필요한 스크롤 방지
      const container = scrollerRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();
      
      if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [active]); // categories 의존성 제거

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
            {categories.map((c) => {
              // 전체 카테고리인지 확인 (categoryId가 null이거나 name이 '전체'인 경우)
              const isAll = !c.key || c.name === '전체';
              
              return (
                <button
                  key={c.key || 'all'}
                  ref={(el) => (itemRefs.current[c.key] = el)}
                  onClick={() => onSelect(c.key)}
                  role="tab"
                  aria-selected={active === c.key}
                  className="relative w-[72px] flex flex-col items-center touch-pan-x select-none"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border transition ${
                      isAll 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'bg-gray-100 border-gray-200 hover:ring-2 hover:ring-gray-200'
                    }`}
                  >
                    {isAll ? (
                      <span className="text-sm font-bold">ALL</span>
                    ) : (c.imageUrl || c.image) ? (
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
                  <div className="mt-2 text-xs text-gray-800 whitespace-nowrap">{c.name}</div>
                  {active === c.key && (
                    <motion.div
                      layoutId="category-underline"
                      className="absolute left-2 right-2 h-[3px] bg-gray-900"
                      style={{ bottom: '-4px' }}
                      transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
            <div aria-hidden className="shrink-0 w-12" />
          </div>
        </div>

        {/* 오른쪽 그라데이션 (이벤트 차단 방지: pointer-events-none, z-0) */}
        <div className="pointer-events-none absolute z-0 top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
