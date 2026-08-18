"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="回到顶部"
      className={`fixed right-5 bottom-8 z-50 w-11 h-11 grid place-items-center bg-white sketch-border sketch-shadow font-hand-display text-[20px] text-secondary hover:text-primary transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none translate-y-3"
      }`}
      style={{ transform: "rotate(-2deg)" }}
    >
      ↑
    </button>
  );
}
