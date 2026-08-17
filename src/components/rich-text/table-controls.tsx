"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import { TextSelection } from "@tiptap/pm/state";

const PICKER_COLS = 8;
const PICKER_ROWS = 6;

/* ─── 图标 ─── */

function IconTableGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M2 6.5h12M6 3v10" />
    </svg>
  );
}

function TbBtn({
  title,
  onClick,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-7 min-w-7 px-1.5 grid place-items-center rounded text-[12px] transition-colors ${
        active
          ? "bg-[#0075de]/10 text-[#0075de]"
          : "text-[#615d59] hover:bg-[#f0efec] hover:text-[#31302e]"
      }`}
    >
      {children}
    </button>
  );
}

function TbDivider() {
  return <span className="mx-0.5 h-4 w-px bg-[#e6e6e6]" />;
}

const chain = (editor: Editor) => editor.chain().focus();
const run = (fn: () => boolean) => () => { fn(); };

/** 是否为覆盖整张表的单元格选区（全选） */
function isWholeTableSelection(state: Editor["state"]): boolean {
  const sel = state.selection;
  if (!(sel instanceof CellSelection)) return false;
  const $anchor = sel.$anchorCell;
  for (let d = $anchor.depth; d > 0; d--) {
    if ($anchor.node(d).type.name !== "table") continue;
    const map = TableMap.get($anchor.node(d));
    const cells = (map as unknown as { map: number[] }).map;
    const start = $anchor.start(d);
    const first = start + cells[0];
    const last = start + cells[cells.length - 1];
    const a = sel.$anchorCell.pos;
    const h = sel.$headCell.pos;
    return (a === first && h === last) || (a === last && h === first);
  }
  return false;
}

/** 是否为跨多个单元格的选区（拖选矩形，但非整表） */
function isMultiCellSelection(state: Editor["state"]): boolean {
  const sel = state.selection;
  return (
    sel instanceof CellSelection &&
    sel.$anchorCell.pos !== sel.$headCell.pos &&
    !isWholeTableSelection(state)
  );
}

export const tableShouldShow = {
  global: ({ state }: { state: Editor["state"] }) => isWholeTableSelection(state),
  cell: ({ state }: { state: Editor["state"] }) => isMultiCellSelection(state),
};

/* ─── 自由行列选择器 ─── */

export function TablePicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const insert = (cols: number, rows: number) => {
    if (cols < 1 || rows < 1) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setOpen(false);
    setHover({ cols: 0, rows: 0 });
  };

  return (
    <div ref={wrapRef} className="relative">
      <TbBtn title="插入表格" active={open} onClick={() => setOpen((v) => !v)}>
        <IconTableGrid />
      </TbBtn>
      {open && (
        <div
          className="kb-table-picker absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 rounded-lg border border-[#e6e6e6] bg-white p-3 shadow-lg"
          onMouseLeave={() => setHover({ cols: 0, rows: 0 })}
        >
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${PICKER_COLS}, 18px)` }}>
            {Array.from({ length: PICKER_ROWS }).map((_, r) =>
              Array.from({ length: PICKER_COLS }).map((_, c) => {
                const active = c < hover.cols && r < hover.rows;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onMouseEnter={() => setHover({ cols: c + 1, rows: r + 1 })}
                    onClick={() => insert(c + 1, r + 1)}
                    className={`h-[18px] w-[18px] rounded-[2px] border transition-colors ${
                      active ? "bg-[#0075de] border-[#0075de]" : "bg-white border-[#d8d5d0] hover:border-[#9abfe6]"
                    }`}
                  />
                );
              })
            )}
          </div>
          <div className="mt-2 text-center font-hand-body text-[13px] text-[#615d59]">
            {hover.cols > 0 ? `${hover.cols} × ${hover.rows}` : "拖动选择行列"}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 全局表格工具条（选中整张表时显示） ─── */

/** 清除当前表格所有单元格的 colwidth，恢复自适应宽度 */
function resetTableWidth(editor: Editor) {
  const { state, view } = editor;
  const { tr } = state;
  const $pos = state.selection.$anchor;
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.type.name !== "table") continue;
    const start = $pos.before(d) + 1;
    node.descendants((cell, pos) => {
      if (
        (cell.type.name === "tableCell" || cell.type.name === "tableHeader") &&
        cell.attrs.colwidth
      ) {
        tr.setNodeMarkup(start + pos, undefined, { ...cell.attrs, colwidth: null });
      }
    });
    view.dispatch(tr);
    return;
  }
}

export function TableGlobalToolbar({ editor }: { editor: Editor }) {
  const c = chain(editor);
  return (
    <div className="flex items-center gap-0.5 px-1 py-1 bg-white rounded-lg border border-[#e6e6e6] shadow-lg">
      <TbBtn title="自适应宽度（清除固定列宽）" onClick={() => resetTableWidth(editor)}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="12" height="10" rx="1" />
          <path d="M6 3v10M2 6.5h12" />
        </svg>
        <span className="ml-1 text-[12px]">自适应宽度</span>
      </TbBtn>
      <TbDivider />
      <TbBtn title="切换表头行" onClick={run(() => c.toggleHeaderRow().run())}>
        <span className="text-[11px] font-medium">TH</span>
      </TbBtn>
      <TbDivider />
      <TbBtn title="删除表格" onClick={run(() => c.deleteTable().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h10M6 6v8M10 6v8M4.5 6l-.5 8h8l-.5-8M5 3.5h6" />
        </svg>
      </TbBtn>
    </div>
  );
}

/* ─── 单元格工具条（拖选多个单元格时显示） ─── */

export function TableCellToolbar({ editor }: { editor: Editor }) {
  const c = chain(editor);

  return (
    <div className="flex items-center gap-0.5 px-1 py-1 bg-white rounded-lg border border-[#e6e6e6] shadow-lg">
      <TbBtn title="合并单元格" onClick={run(() => c.mergeCells().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="12" height="10" rx="1" />
          <path d="M9 3v10" strokeDasharray="2 2" />
        </svg>
      </TbBtn>
      <TbBtn title="拆分单元格" onClick={run(() => c.splitCell().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="12" height="10" rx="1" />
          <path d="M8 3v10" />
        </svg>
      </TbBtn>
      <TbDivider />
      <TbBtn title="左侧插入列" onClick={run(() => c.addColumnBefore().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="3" width="8" height="10" rx="1" />
          <path d="M3 8h3M4.5 6.5L3 8l1.5 1.5" />
        </svg>
      </TbBtn>
      <TbBtn title="右侧插入列" onClick={run(() => c.addColumnAfter().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="8" height="10" rx="1" />
          <path d="M10 8h3M11.5 6.5L13 8l-1.5 1.5" />
        </svg>
      </TbBtn>
      <TbBtn title="删除列" onClick={run(() => c.deleteColumn().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="4" height="10" rx="1" />
          <path d="M9 4l3 8M12 4l-3 8" />
        </svg>
      </TbBtn>
      <TbDivider />
      <TbBtn title="上方插入行" onClick={run(() => c.addRowBefore().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="6" width="11" height="7.5" rx="1" />
          <path d="M8 2v3M6.5 3.5L8 2l1.5 1.5" />
        </svg>
      </TbBtn>
      <TbBtn title="下方插入行" onClick={run(() => c.addRowAfter().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="2.5" width="11" height="7.5" rx="1" />
          <path d="M8 11v3M6.5 12.5L8 14l1.5-1.5" />
        </svg>
      </TbBtn>
      <TbBtn title="删除行" onClick={run(() => c.deleteRow().run())}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="2.5" width="11" height="4" rx="1" />
          <path d="M4 9l3 5M12 9l-3 5" />
        </svg>
      </TbBtn>
    </div>
  );
}

/* ─── 左上角全选手柄 ─── */

function selectAllTable(editor: Editor): boolean {
  const { state, view } = editor;
  let $pos = state.selection.$anchor;
  let tableNode = null as null | { node: unknown; pos: number };
  for (let d = $pos.depth; d >= 0; d--) {
    const node = $pos.node(d);
    if (node.type.name === "table") {
      tableNode = { node, pos: $pos.before(d) };
      break;
    }
  }
  if (!tableNode) return false;
  const map = TableMap.get(tableNode.node as Parameters<typeof TableMap.get>[0]);
  const cells = (map as unknown as { map: number[] }).map;
  const start = tableNode.pos + 1;
  const first = start + cells[0];
  const last = start + cells[cells.length - 1];
  const tr = state.tr.setSelection(CellSelection.create(state.doc, first, last));
  view.dispatch(tr.scrollIntoView());
  return true;
}

export function TableGrip({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const { state, view } = editor;
      const sel = state.selection;
      let wrapper: HTMLElement | null = null;

      const findWrapper = ($pos: typeof sel.$anchor) => {
        for (let d = $pos.depth; d > 0; d--) {
          if ($pos.node(d).type.name === "table") {
            const node = view.nodeDOM($pos.before(d)) as HTMLElement | null;
            if (!node) continue;
            // tiptap TableView 的 .dom 是 .tableWrapper；兜底再向上找
            if (node.classList?.contains("tableWrapper")) return node;
            const wrap = node.closest?.(".tableWrapper");
            if (wrap) return wrap as HTMLElement;
            if (node.tagName === "TABLE") return node;
          }
        }
        return null;
      };

      if (sel instanceof CellSelection) {
        wrapper = findWrapper(sel.$anchorCell);
      } else if (sel instanceof TextSelection) {
        wrapper = findWrapper(sel.$anchor);
      }
      if (wrapper) {
        const r = wrapper.getBoundingClientRect();
        setPos({ x: r.left - 14, y: r.top - 6 });
      } else {
        setPos(null);
      }
    };

    update();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [editor]);

  if (!pos) return null;

  return (
    <button
      type="button"
      title="全选表格"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => selectAllTable(editor)}
      className="kb-table-grip"
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 40 }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="3.5" cy="3.5" r="1.6" />
        <circle cx="8" cy="3.5" r="1.6" />
        <circle cx="12.5" cy="3.5" r="1.6" />
        <circle cx="3.5" cy="8" r="1.6" />
        <circle cx="8" cy="8" r="1.6" />
        <circle cx="12.5" cy="8" r="1.6" />
        <circle cx="3.5" cy="12.5" r="1.6" />
        <circle cx="8" cy="12.5" r="1.6" />
        <circle cx="12.5" cy="12.5" r="1.6" />
      </svg>
    </button>
  );
}

/* ─── 右键单元格菜单 ─── */

interface MenuItem {
  key: string;
  label: string;
  run: () => void;
  danger?: boolean;
}

export function TableContextMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editor.view.dom as HTMLElement;
    const onContext = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("td, th")) return;
      e.preventDefault();
      setOpen({ x: e.clientX, y: e.clientY });
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    el.addEventListener("contextmenu", onContext);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("contextmenu", onContext);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [editor]);

  if (!open) return null;

  const c = chain(editor);
  const items: MenuItem[] = [
    { key: "merge", label: "合并单元格", run: () => c.mergeCells().run() },
    { key: "split", label: "拆分单元格", run: () => c.splitCell().run() },
    { key: "sep1", label: "---", run: () => {} },
    { key: "colBefore", label: "左侧插入列", run: () => c.addColumnBefore().run() },
    { key: "colAfter", label: "右侧插入列", run: () => c.addColumnAfter().run() },
    { key: "colDel", label: "删除列", run: () => c.deleteColumn().run() },
    { key: "rowBefore", label: "上方插入行", run: () => c.addRowBefore().run() },
    { key: "rowAfter", label: "下方插入行", run: () => c.addRowAfter().run() },
    { key: "rowDel", label: "删除行", run: () => c.deleteRow().run() },
    { key: "sep2", label: "---", run: () => {} },
    { key: "header", label: "切换表头行", run: () => c.toggleHeaderRow().run() },
    { key: "del", label: "删除表格", run: () => c.deleteTable().run(), danger: true },
  ];

  const close = () => setOpen(null);

  return (
    <div
      ref={ref}
      className="kb-context-menu"
      style={{ position: "fixed", left: open.x, top: open.y, zIndex: 60 }}
    >
      {items.map((it) =>
        it.label === "---" ? (
          <div key={it.key} className="kb-context-sep" />
        ) : (
          <button
            key={it.key}
            type="button"
            className={`kb-context-item ${it.danger ? "is-danger" : ""}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { it.run(); close(); }}
          >
            {it.label}
          </button>
        )
      )}
    </div>
  );
}
