// src/components/CategorySheet.jsx
import React from "react";

export default function CategorySheet({ categories, active, expanded, onClose, onSelect }) {
  return (
    <>
      {/* 배경 스크림 */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/25 transition-opacity duration-200 ${
          expanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* 시트 */}
      <section
        role="dialog"
        aria-modal="true"
        className={`fixed left-0 right-0 top-20 z-30 rounded-t-2xl bg-white shadow-lg transition-all duration-200 ${
          expanded ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-bold text-[15px]">메뉴 전체보기</span>
          <button onClick={onClose} className="w-9 h-9 text-lg">⌃</button>
        </div>
        <div className="grid grid-cols-4 gap-3 p-3">
          {categories.map((c) => (
            <button
              key={`grid-${c.key}`}
              onClick={() => { onSelect(c.key); onClose(); }}
              className="flex flex-col items-center"
            >
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-2xl border text-[22px] ${
                  active === c.key ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                {(c.imageUrl || c.image) ? (
                  <img
                    src={c.imageUrl || c.image}
                    alt={c.name || "카테고리 이미지"}
                    className="w-12 h-12 object-contain"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span aria-hidden>{c.emoji || "🏷️"}</span>
                )}
              </div>
              <div className="mt-1 text-sm">{c.name}</div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}