"use client";

import { useEffect } from "react";

const ICON_COPY =
  '<svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5v-1a1.5 1.5 0 0 0-1.5-1.5H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 11h1.5"/></svg>';
const ICON_CHECK =
  '<svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.5 3.5L13 5"/></svg>';

/**
 * 阅读页代码复制按钮：挂载后在每个 .kb-code 右上角注入"复制"按钮。
 * - 代码块外包一层相对定位容器，避免横向滚动时按钮跟着滚走
 * - 按钮配色跟随代码块 data-theme（明/暗）
 * - 复制后切换为"已复制"反馈，1.5s 后还原
 */
export default function ArticleCodeCopy() {
  useEffect(() => {
    const pres = Array.from(
      document.querySelectorAll<HTMLPreElement>(".prose-kb .kb-code"),
    );
    const timers: number[] = [];

    const showCopied = (btn: HTMLButtonElement) => {
      btn.classList.add("kb-code-copy--copied");
      btn.innerHTML = `${ICON_CHECK}<span>已复制</span>`;
      const t = window.setTimeout(() => {
        btn.classList.remove("kb-code-copy--copied");
        btn.innerHTML = `${ICON_COPY}<span>复制</span>`;
      }, 1500);
      timers.push(t);
    };

    const copy = async (btn: HTMLButtonElement, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showCopied(btn);
      } catch {
        /* 剪贴板不可用时静默忽略 */
      }
    };

    // 记录每个代码块的回滚操作（StrictMode 下 effect 会执行两次，需完整还原）
    const undo: (() => void)[] = [];

    for (const pre of pres) {
      const code = pre.querySelector("code");
      if (!code) continue;

      const theme = pre.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const parent = pre.parentNode;

      const wrapper = document.createElement("div");
      wrapper.className = "kb-code-wrap";
      parent?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kb-code-copy";
      btn.dataset.theme = theme;
      btn.setAttribute("aria-label", "复制代码");
      btn.innerHTML = `${ICON_COPY}<span>复制</span>`;
      btn.addEventListener("click", () => copy(btn, code.textContent ?? ""));
      wrapper.appendChild(btn);

      undo.push(() => {
        btn.remove();
        parent?.insertBefore(pre, wrapper);
        wrapper.remove();
      });
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      undo.forEach((fn) => fn());
    };
  }, []);

  return null;
}
