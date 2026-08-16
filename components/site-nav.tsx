"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchDialog from "@/components/search-dialog";

const navLinks = [
  { label: "首页", href: "/" },
  { label: "分类", href: "/categories" },
  { label: "标签", href: "/tags" },
  { label: "收藏", href: "/favorites" },
];

export default function SiteNav() {
  const pathname = usePathname();
  // 首页仅精确匹配；其余支持子路径（如 /article/xxx 不误伤）
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex items-center gap-1.5">
      <SearchDialog />
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
    </nav>
  );
}
