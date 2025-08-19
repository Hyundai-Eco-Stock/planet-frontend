import React, { useState } from "react";
import CategoryBar from "./CategoryBar";
import CategorySheet from "./CategorySheet";

const CATEGORIES = [
  { key: "home",    name: "홈",         emoji: "🏠" },
  { key: "cafe",    name: "카페·디저트", emoji: "🥤" },
  { key: "chicken", name: "치킨",       emoji: "🍗" },
  { key: "noodle",  name: "중식",       emoji: "🍜" },
  { key: "korean",  name: "한식",       emoji: "🥘" },
  { key: "fast",    name: "패스트푸드",  emoji: "🍔" },
  { key: "sushi",   name: "돈까스·회",   emoji: "🍣" },
  { key: "snack",   name: "분식",       emoji: "🌭" }
];

export default function ShoppingMain() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState("cafe");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <CategoryBar
        categories={CATEGORIES}
        active={active}
        expanded={expanded}
        onSelect={setActive}
        onToggle={() => setExpanded((v) => !v)}
      />
      <CategorySheet
        categories={CATEGORIES}
        active={active}
        expanded={expanded}
        onClose={() => setExpanded(false)}
        onSelect={setActive}
      />
      <main className="p-4">
        <div className="h-96 rounded-xl bg-gray-50" />
      </main>
    </div>
  );
}