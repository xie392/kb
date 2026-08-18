"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SearchDialog from "@/components/search-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "首页", href: "/" },
  { label: "分类", href: "/categories" },
  { label: "标签", href: "/tags" },
  { label: "收藏", href: "/favorites" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // 首页仅精确匹配；其余支持子路径（如 /article/xxx 不误伤）
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  // 路由切换后自动关闭移动菜单
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
                  ? "bg-white sketch-border sketch-shadow text-primary font-bold"
                  : `text-ink-muted hover:text-primary ${
                      i % 2 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]"
                    }`
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* 移动端汉堡菜单（Base UI DropdownMenu，内置 click-outside 关闭） */}
      <div className="md:hidden">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="size-10 text-[18px]"
                aria-label={open ? "关闭菜单" : "打开菜单"}
              />
            }
          >
            {open ? "✕" : "☰"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {navLinks.map((link, i) => {
              const active = isActive(link.href);
              return (
                <DropdownMenuItem
                  key={link.href}
                  render={<Link href={link.href} />}
                  className={cn(
                    "font-hand-display text-[17px] transition-colors",
                    active
                      ? "text-primary font-bold"
                      : `text-ink-muted hover:text-primary ${
                          i % 2 ? "rotate-[0.3deg]" : "rotate-[-0.3deg]"
                        }`
                  )}
                >
                  {link.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
