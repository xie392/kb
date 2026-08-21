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
  "PRE",
  "UL",
  "OL",
  "TABLE",
  "HR",
  "DIV",
  "LI",
]);

const SKIP_CLASS = [
  "kb-columns",
  "kb-column",
  "kb-details",
  "kb-details-content",
];

function isBlockDom(el: Element | null): boolean {
  if (!el || el.nodeType !== 1) return false;
  if (el.classList.contains("ProseMirror")) return false;
  if (SKIP_CLASS.some((c) => el.classList.contains(c))) return false;
  // NodeView wrapper（如 image-block / callout / iframe）
  if (el.hasAttribute("data-node-view-wrapper")) return true;
  if (el.hasAttribute("data-type")) return true;
  if (!BLOCK_SELECTOR.has(el.tagName)) return false;
  // 列表内部项：LI 作为块；UL/OL 整体不作为手柄目标（避免选中整个列表）
  if (el.tagName === "UL" || el.tagName === "OL") return false;
  return true;
}

function findBlockEl(start: EventTarget | null, root: HTMLElement): HTMLElement | null {
  let el = start as HTMLElement | null;
  while (el && el !== root) {
    if (isBlockDom(el)) {
      // 对 LI：若其父列表只有 1 项则不显示（与 demo 一致，避免整列表拖拽）
      if (el.tagName === "LI") {
        const list = el.parentElement;
        if (list && list.childElementCount <= 1) return null;
      }
      return el;
    }
    el = el.parentElement;
  }
  return null;
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
      const blockPos = view.posAtDOM(activeEl, 0);
      if (blockPos == null) return;
      // 在块前插入空段落，并键入 "/" 唤起 SlashMenu
      const { paragraph } = view.state.schema.nodes;
      const tr = view.state.tr;
      tr.insert(blockPos, paragraph.create());
      tr.setSelection(TextSelection.near(tr.doc.resolve(blockPos + 1)));
      tr.insertText("/", blockPos + 1, blockPos + 1);
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
      const blockPos = view.posAtDOM(activeEl, 0);
      if (blockPos == null) return;
      // 不 preventDefault：需要让浏览器原生 dragstart 触发（按钮 draggable=true）。
      try {
        const sel = NodeSelection.create(view.state.doc, blockPos);
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
      const isLi = blockEl.tagName === "LI";
      // 用 fixed + 视口坐标，显示在编辑区左侧留白（Notion 风格）
      const left = rect.left - wrapW - 8 - (isLi ? 24 : 0);
      const top = rect.top + 4;
      wrap.style.left = `${Math.max(8, left)}px`;
      wrap.style.top = `${top}px`;
      wrap.classList.remove("is-hidden");
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
      addBtn.textContent = "+";

      dragBtn = document.createElement("button");
      dragBtn.type = "button";
      dragBtn.draggable = true;
      dragBtn.className = "kb-block-handle kb-block-handle-drag";
      dragBtn.setAttribute("aria-label", "拖拽移动");
      dragBtn.title = "拖拽移动";
      dragBtn.innerHTML =
        '<svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true"><circle cx="2" cy="3" r="1.2"/><circle cx="8" cy="3" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="2" cy="13" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg>';

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
              return false;
            },
            keydown: () => {
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
