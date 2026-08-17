"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SearchDialog from "@/components/search-dialog";

const navLinks = [
  { label: "首页", href: "/" },
  { label: "分类", href: "/categories" },
  { label: "标签", href: "/tags" },
  { label: "收藏", href: "/favorites" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // 首页仅精确匹配；其余支持子路径（如 /article/xxx 不误伤）
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  // 路由切换后自动关闭移动菜单
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 点击外部关闭移动菜单
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <nav className="flex items-center gap-1.5">
      <SearchDialog />

      {/* 平板/桌面端导航 */}
      <div className="hidden md:flex items-center gap-1.5">
        {navLinks.map((link, i) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-hand-display text-[17px] px-4 py-1.5 transition-colors ${
                active
                  ? "bg-white sketch-border sketch-shadow text-[#0075de] font-bold"
                  : `text-[#615d59] hover:text-[#0075de] ${
                      i % 2 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]"
                    }`
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* 移动端汉堡菜单 */}
      <div ref={menuRef} className="relative md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          className="w-10 h-10 grid place-items-center bg-white sketch-border sketch-shadow font-hand-display text-[18px] text-[#31302e] hover:text-[#0075de] transition-colors"
        >
          {open ? "✕" : "☰"}
        </button>

        {open && (
          <div className="absolute right-0 top-[52px] w-40 bg-[#fbfaf6] sketch-border sketch-shadow p-1.5 fade-up z-50">
            {navLinks.map((link, i) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 font-hand-display text-[17px] transition-colors ${
                    active
                      ? "text-[#0075de] font-bold"
                      : `text-[#615d59] hover:text-[#0075de] ${
                          i % 2 ? "rotate-[0.3deg]" : "rotate-[-0.3deg]"
                        }`
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
