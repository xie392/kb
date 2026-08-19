"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SearchDialog from "@/components/search-dialog";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/xie392/kb";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.03 11.03 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

const navLinks = [
  { label: "首页", href: "/" },
  { label: "知识库", href: "/categories" },
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
        <ThemeToggle />
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 仓库"
          className="ml-1 p-2 text-ink-muted hover:text-primary transition-colors rotate-[-0.5deg]"
        >
          <GithubIcon className="w-5 h-5" />
        </a>
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
            <DropdownMenuItem
              render={
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" />
              }
              className="font-hand-display text-[17px] text-ink-muted hover:text-primary flex items-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
