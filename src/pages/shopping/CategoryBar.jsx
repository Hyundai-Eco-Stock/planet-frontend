// src/components/CategoryBar.jsx
import React, { useEffect, useRef } from "react";

export default function CategoryBar({ categories, active, onSelect, expanded, onToggle }) {
  const scrollerRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const el = itemRefs.current[active];
    if (el) el.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <section className="sticky top-0 z-20 bg-white pt-2 pb-1">
      <div className="relative">
        {/* 스크롤 영역 (스크롤바 숨김) */}
        <div
          ref={scrollerRef}
          className="overflow-x-auto pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="inline-flex gap-3 pb-2">
            {categories.map((c) => (
              <button
                key={c.key}
                ref={(el) => (itemRefs.current[c.key] = el)}
                onClick={() => onSelect(c.key)}
                role="tab"
                aria-selected={active === c.key}
                className="relative w-[72px] flex flex-col items-center"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl border text-[22px]
                  ${active === c.key ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                >
                  {(c.imageUrl || c.image) ? (
                    <img
                      src={c.imageUrl || c.image}
                      alt={c.name || "카테고리 이미지"}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span aria-hidden>{c.emoji || "🏷️"}</span>
                  )}
                </div>
                <div className="mt-1 text-xs whitespace-nowrap">{c.name}</div>
                {active === c.key && (
                  <div className="absolute left-2 right-2 -bottom-0.5 h-[3px] rounded bg-gray-900" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽 그라데이션 */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
