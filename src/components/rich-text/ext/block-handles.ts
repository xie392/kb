"use client";

import { Extension } from "@tiptap/core";
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
  type Selection,
} from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

/* ─── BlockHandles：Notion 风格块级双柄 ───
 * 鼠标悬停块时，在块左侧显示两个按钮：
 *   +   在块前插入空段落并键入 "/" 唤起 SlashMenu
 *   ⋮⋮  拖拽手柄（按住拖动整个块）
 * 借鉴 demo/knloop-frontend-main 的 dragable 思路，合并 + 号插入手柄。
 * 定位：从事件 target 向上找到最外层块级 DOM（ProseMirror 的直接子节点 / LI），
 * 排除 doc / 表格单元格 / 列内部等。
 */

const BLOCK_SELECTOR = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "UL",
  "OL",
  "TABLE",
  "HR",
  "LI",
]);

const SKIP_CLASS = [
  "kb-column",
  "kb-details-content",
];

function isNodeViewWrapper(el: Element): boolean {
  return (
    el.hasAttribute("data-node-view-wrapper") &&
    !el.hasAttribute("data-node-view-content-react")
  );
}

function isBlockDom(el: Element | null): boolean {
  if (!el || el.nodeType !== 1) return false;
  if (el.classList.contains("ProseMirror")) return false;
  if (SKIP_CLASS.some((c) => el.classList.contains(c))) return false;
  if (isNodeViewWrapper(el)) return true;
  if (el.hasAttribute("data-type")) return true;
  if (!BLOCK_SELECTOR.has(el.tagName)) return false;
  if (el.tagName === "UL" || el.tagName === "OL") return false;
  return true;
}

/**
 * 找容器块内承载"首行文字"的元素，用于精确计算垂直中线。
 * - details：取内部的 <summary>（标题行）
 * - columns：取第一个非空 column 内的首个块（段落/标题等）
 * - blockquote：取首个段落
 * - 其他：如果自身有可见文字，直接用自身
 */
function findFirstLineEl(blockEl: HTMLElement): HTMLElement | null {
  // details：summary 是首行标题
  const summary = blockEl.querySelector(":scope > summary");
  if (summary instanceof HTMLElement) return summary;

  // columns：第一个非空 column 的第一个块子元素
  const firstColumn = blockEl.querySelector(
    ":scope > .kb-column"
  ) as HTMLElement | null;
  if (firstColumn) {
    const firstChild = firstColumn.querySelector(
      ":scope > p, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6"
    );
    if (firstChild instanceof HTMLElement) return firstChild;
    return firstColumn;
  }

  // blockquote 等其他容器：取第一个段落/标题
  const firstInner = blockEl.querySelector(
    ":scope > p, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6"
  );
  if (firstInner instanceof HTMLElement) return firstInner;

  return null;
}

function findBlockEl(start: EventTarget | null, root: HTMLElement): HTMLElement | null {
  // 自内向外收集所有命中的块级元素。
  // 主流编辑器规则：
  //  - blockquote 这类“块容器”包裹段落时，手柄锚定最外层容器（整段引用），
  //    而不是内部的 <p>，否则手柄会落在 padding/边框内侧、位置错乱。
  //  - 列表/任务列表中，每个 <li> 才是独立可拖拽单元，取最内层 <li>（当前行），
  //    内层 <p>/<hN> 等只是内容。
  const candidates: HTMLElement[] = [];
  let el = start as HTMLElement | null;
  while (el && el !== root) {
    const cur = el;
    if (isNodeViewWrapper(cur)) {
      if (SKIP_CLASS.some((c) => cur.classList.contains(c))) return null;
      return cur;
    }
    if (isBlockDom(cur)) {
      if (cur.tagName !== "LI" && cur.closest("li")) {
        el = cur.parentElement;
        continue;
      }
      candidates.push(cur);
    }
    el = cur.parentElement;
  }
  if (candidates.length === 0) return null;

  // 列表项：取最内层（第一个）<li>，即当前悬停行
  const innermostLi = candidates.find((c) => c.tagName === "LI");
  if (innermostLi) {
    const list = innermostLi.parentElement;
    if (list && list.childElementCount <= 1) return null;
    return innermostLi;
  }

  // 其他块：取最外层容器（最后一个），如 blockquote 包裹段落时锚定 blockquote
  return candidates[candidates.length - 1];
}

/* 归一化块的文档 node 边界位置（node pos）：
 * view.posAtDOM(el, 0) 对普通块（段落/标题/列表项等）返回“内容开始”（node pos + 1），
 * 对 NodeView / 原子块（imageBlock 等）返回 node pos 本身。
 * 这里统一处理：
 *  - 若该位置本身是块节点边界（parentOffset === 0 且 nodeAfter 是块）→ 直接用；
 *  - 否则取该位置所在块的起点（$pos.before()）。
 * 有了正确的 node pos，NodeSelection.create / tr.insert 才能落在块边界上，
 * 否则会插到块内部、或使 view.nodeDOM 返回 undefined 导致 BubbleMenu 崩溃。
 */
function getBlockNodePos(view: EditorView, el: HTMLElement): number | null {
  const pos = view.posAtDOM(el, 0);
  if (pos == null || pos <= 0) return null;
  const $pos = view.state.doc.resolve(pos);
  if ($pos.parentOffset === 0 && $pos.nodeAfter && $pos.nodeAfter.isBlock) {
    return pos;
  }
  const start = $pos.before();
  return start < 0 ? null : start;
}

export const BlockHandles = Extension.create({
  name: "blockHandles",

  addProseMirrorPlugins() {
    const key = new PluginKey("blockHandles");
    const editor = this.editor;

    let view: EditorView | null = null;
    let wrap: HTMLElement | null = null;
    let addBtn: HTMLButtonElement | null = null;
    let dragBtn: HTMLButtonElement | null = null;
    let activeEl: HTMLElement | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let activeSelection: Selection | null = null;

    const clearHide = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      wrap?.classList.remove("is-hidden");
    };

    const scheduleHide = () => {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => wrap?.classList.add("is-hidden"), 280);
    };

    const onAddClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activeEl || !view) return;
      // 用块节点边界位置（而非内容位置），避免在块内部插入导致段落被拆分
      const nodePos = getBlockNodePos(view, activeEl);
      if (nodePos == null) return;
      const { paragraph } = view.state.schema.nodes;
      const tr = view.state.tr;
      // 在块前插入空段落，并键入 "/" 唤起 SlashMenu
      tr.insert(nodePos, paragraph.create());
      tr.insertText("/", nodePos + 1, nodePos + 1);
      // 光标落在 "/" 之后（新段落内容起点 nodePos+1 + "/" 占 1）
      tr.setSelection(TextSelection.create(tr.doc, nodePos + 2));
      view.dispatch(tr.scrollIntoView());
      view.focus();
      wrap?.classList.add("is-hidden");
    };

    const onButtonMouseDown = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onDragMouseDown = (e: Event) => {
      if (!activeEl || !view) return;
      // 必须用块节点边界位置创建 NodeSelection；
      // 用内容位置会让 view.nodeDOM 返回 undefined，导致 BubbleMenu 崩
      const nodePos = getBlockNodePos(view, activeEl);
      if (nodePos == null) return;
      // 不 preventDefault：需要让浏览器原生 dragstart 触发（按钮 draggable=true）。
      try {
        const sel = NodeSelection.create(view.state.doc, nodePos);
        view.dispatch(view.state.tr.setSelection(sel));
        view.focus();
        activeSelection = sel;
      } catch {
        activeSelection = null;
      }
    };

    const onDragStart = (e: DragEvent) => {
      if (!activeEl || !activeSelection || !view || !e.dataTransfer) return;
      const slice = activeSelection.content();
      const { dom, text } = view.serializeForClipboard(slice);
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.clearData();
      e.dataTransfer.setData("text/html", dom.innerHTML);
      e.dataTransfer.setData("text/plain", text);
      e.dataTransfer.setDragImage(activeEl, 0, 0);
      view.dragging = { slice, move: true };
    };

    const onDragEnd = () => {
      activeSelection = null;
    };

    const positionUI = (blockEl: HTMLElement) => {
      if (!wrap || !view) return;
      const rect = blockEl.getBoundingClientRect();
      const wrapW = wrap.offsetWidth || 40;
      const wrapH = wrap.offsetHeight || 24;
      const isLi = blockEl.tagName === "LI";
      const left = rect.left - wrapW - 8 - (isLi ? 24 : 0);

      // 垂直位置：锚定"首行文字"的中线，而非容器 padding。
      // 对 details / columns / blockquote 这类容器，padding 在子元素上，
      // 直接用容器自身的 paddingTop+lineHeight 会把手柄算到边框上。
      // 这里找第一个真正承载首行文字的子元素（summary / 首个段落等），
      // 用它的矩形来算中线；找不到再回退到容器自身的 CSS 计算。
      let top: number;
      const firstLineEl = findFirstLineEl(blockEl);
      if (firstLineEl) {
        const r = firstLineEl.getBoundingClientRect();
        const cs = getComputedStyle(firstLineEl);
        const padTop = parseFloat(cs.paddingTop) || 0;
        const lineH =
          parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6 || 24;
        top = r.top + padTop + lineH / 2 - wrapH / 2;
      } else {
        const cs = getComputedStyle(blockEl);
        const padTop = parseFloat(cs.paddingTop) || 0;
        const lineH =
          parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6 || 24;
        top = rect.top + padTop + lineH / 2 - wrapH / 2;
      }
      wrap.style.left = `${Math.max(8, left)}px`;
      wrap.style.top = `${top}px`;
      wrap.classList.remove("is-hidden");
    };

    const positionAtSelection = (v: EditorView) => {
      const { selection } = v.state;
      if (!(selection instanceof NodeSelection)) return;
      const dom = v.nodeDOM(selection.from);
      if (dom instanceof HTMLElement) {
        const blockEl = findBlockEl(dom, v.dom as HTMLElement);
        if (blockEl) {
          activeEl = blockEl;
          positionUI(blockEl);
        }
      }
    };

    const createUI = () => {
      if (wrap) return;
      wrap = document.createElement("div");
      wrap.className = "kb-block-handles is-hidden";

      addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "kb-block-handle kb-block-handle-add";
      addBtn.setAttribute("aria-label", "在上方插入");
      addBtn.title = "在上方插入（/）";
      addBtn.innerHTML =
        '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

      dragBtn = document.createElement("button");
      dragBtn.type = "button";
      dragBtn.draggable = true;
      dragBtn.className = "kb-block-handle kb-block-handle-drag";
      dragBtn.setAttribute("aria-label", "拖拽移动");
      dragBtn.title = "拖拽移动";
      dragBtn.innerHTML =
        '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="4" cy="3.5" r="1.3"/><circle cx="12" cy="3.5" r="1.3"/><circle cx="4" cy="8" r="1.3"/><circle cx="12" cy="8" r="1.3"/><circle cx="4" cy="12.5" r="1.3"/><circle cx="12" cy="12.5" r="1.3"/></svg>';

      wrap.appendChild(addBtn);
      wrap.appendChild(dragBtn);

      // 挂到 body + fixed，避免被编辑区 overflow/padding 裁剪
      wrap.style.position = "fixed";
      wrap.style.zIndex = "50";
      document.body.appendChild(wrap);

      addBtn.addEventListener("click", onAddClick);
      addBtn.addEventListener("mousedown", onButtonMouseDown);
      dragBtn.addEventListener("mousedown", onDragMouseDown);
      dragBtn.addEventListener("dragstart", onDragStart);
      dragBtn.addEventListener("dragend", onDragEnd);
      wrap.addEventListener("mouseenter", clearHide);
      wrap.addEventListener("mouseleave", scheduleHide);
      // fixed 定位：滚动时跟随块元素
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll, true);
    };

    const onScroll = () => {
      if (activeEl && wrap && !wrap.classList.contains("is-hidden")) {
        positionUI(activeEl);
      }
    };

    const destroyUI = () => {
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll, true);
      addBtn?.removeEventListener("click", onAddClick);
      addBtn?.removeEventListener("mousedown", onButtonMouseDown);
      dragBtn?.removeEventListener("mousedown", onDragMouseDown);
      dragBtn?.removeEventListener("dragstart", onDragStart);
      dragBtn?.removeEventListener("dragend", onDragEnd);
      wrap?.removeEventListener("mouseenter", clearHide);
      wrap?.removeEventListener("mouseleave", scheduleHide);
      wrap?.remove();
      wrap = addBtn = dragBtn = null;
      activeEl = null;
    };

    return [
      new Plugin({
        key,
        view: (v) => {
          view = v;
          if (v.editable) createUI();
          return {
            update: (updatedView) => {
              view = updatedView;
              if (updatedView.editable && wrap) {
                positionAtSelection(updatedView);
              }
            },
            destroy: () => destroyUI(),
          };
        },
        props: {
          handleDOMEvents: {
            mousemove: (v, event) => {
              if (!v.editable || !wrap) return false;
              const blockEl = findBlockEl(event.target as EventTarget, v.dom as HTMLElement);
              if (!blockEl) {
                scheduleHide();
                activeEl = null;
                return false;
              }
              activeEl = blockEl;
              positionUI(blockEl);
              return false;
            },
            mouseleave: () => {
              scheduleHide();
              return false;
            },
            mousedown: () => {
              wrap?.classList.add("is-hidden");
              requestAnimationFrame(() => {
                if (view) positionAtSelection(view);
              });
              return false;
            },
            keydown: (_v, event) => {
              if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
                return false;
              }
              wrap?.classList.add("is-hidden");
              return false;
            },
          },
        },
      }),
    ];
  },
});

export default BlockHandles;
