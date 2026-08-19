"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * 主题上下文（next-themes）：
 * - attribute="class" → 通过 <html>.dark 切换暗色
 * - defaultTheme="system" + enableSystem → 默认跟随系统
 * - disableTransitionOnChange → 颜色切换不做 CSS transition，
 *   避免与自研的"圆形扩散"切换动画冲突
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
