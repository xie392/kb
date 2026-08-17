"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_HOME } from "@/lib/config";

const navItems = [
  { label: "数据看板", href: ADMIN_HOME, icon: "dashboard" },
  { label: "文章管理", href: `${ADMIN_HOME}/articles`, icon: "articles" },
  { label: "分类管理", href: `${ADMIN_HOME}/categories`, icon: "categories" },
  { label: "标签管理", href: `${ADMIN_HOME}/tags`, icon: "tags" },
  { label: "系统设置", href: `${ADMIN_HOME}/settings`, icon: "settings" },
];

function NavIcon({ name }: { name: string }) {
  const cls = "w-[18px] h-[18px]";
  switch (name) {
    case "dashboard":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" />
          <rect x="11" y="11" width="6" height="6" rx="1.5" />
        </svg>
      );
    case "articles":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 3.5h8l3 3v10H4v-13z" strokeLinejoin="round" />
          <path d="M12 3.5v3h3" strokeLinejoin="round" />
          <path d="M7 10.5h6M7 13.5h6" strokeLinecap="round" />
        </svg>
      );
    case "categories":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" />
          <path d="M14 11v3h3" strokeLinecap="round" />
        </svg>
      );
    case "tags":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 11.5L8.5 6a1.5 1.5 0 0 1 2.1 0l4.2 4.2a1.5 1.5 0 0 1 0 2.1L9.3 17.9A1.5 1.5 0 0 1 7.2 17.9l-4.2-4.2a1.5 1.5 0 0 1 0-2.1z" />
          <circle cx="12" cy="7" r="1.5" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="2.5" />
          <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.8 4.8l1.4 1.4M13.8 13.8l1.4 1.4M4.8 15.2l1.4-1.4M13.8 6.2l1.4-1.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function AdminNav() {
  const pathname = usePathname();
  // 数据看板是其他菜单的公共前缀（{ADMIN_HOME}/articles 等），仅精确匹配；
  // 其余菜单精确匹配或子路径匹配（如 {ADMIN_HOME}/articles/xxx/edit → 文章管理高亮）
  const isActive = (href: string) =>
    href === ADMIN_HOME
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex-1 px-2 mt-2 space-y-0.5">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2.5 px-2.5 py-[8px] sketch-border text-[16px] font-hand-display transition-colors ${
              active
                ? "bg-[#f6f5f4] sketch-border text-[#0075de] font-bold"
                : "text-[#615d59] hover:bg-[#f6f5f4]/60 hover:text-[#31302e]"
            }`}
          >
            <span className={active ? "text-primary" : "text-[#a39e98]"}>
              <NavIcon name={item.icon} />
            </span>
            {item.label}
            {active && <span className="ml-auto w-1 h-1 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}
