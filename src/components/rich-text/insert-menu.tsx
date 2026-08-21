"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInsertActions } from "./insert-actions";
import { getPreview, PREVIEW_WIDTH, PREVIEW_GAP } from "./insert-preview";
import { HandPlus } from "./hand-icons";
import { ToolbarBtn } from "./toolbar";

interface InsertMenuProps {
  editor: Editor;
  openImagePicker?: () => void;
}

const GROUPS = ["基础", "结构", "媒体"] as const;

export function InsertMenu({ editor, openImagePicker }: InsertMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number } | null>(null);

  const items = useMemo(
    () => (editor ? getInsertActions({ editor, openImagePicker }) : []),
    [editor, openImagePicker]
  );

  const visibleItems = useMemo(() => {
    const result: typeof items = [];
    for (const g of GROUPS) {
      for (const it of items) if (it.group === g) result.push(it);
    }
    return result;
  }, [items]);

  useEffect(() => {
    if (!open) {
      setActiveId(null);
      setPreviewPos(null);
    } else if (visibleItems.length > 0) {
      setActiveId(visibleItems[0].id);
    }
  }, [open, visibleItems]);

  useLayoutEffect(() => {
    if (!open || !activeId) return;
    let raf = 0;
    const calc = () => {
      const list = document.querySelector<HTMLElement>("[data-slot='command-list']");
      const popup = document.querySelector<HTMLElement>("[data-slot='dropdown-menu-content']");
      if (!list || !popup) {
        raf = requestAnimationFrame(calc);
        return;
      }
      const el = list.querySelector<HTMLElement>(`[data-action-id="${activeId}"]`);
      if (!el) return;
      const itemRect = el.getBoundingClientRect();
      const contentRect = popup.getBoundingClientRect();
      const spaceRight = typeof window !== "undefined"
        ? window.innerWidth - contentRect.right
        : 999;
      const onRight = spaceRight >= PREVIEW_WIDTH + PREVIEW_GAP + 16;
      const left = onRight
        ? contentRect.right + PREVIEW_GAP
        : contentRect.left - PREVIEW_WIDTH - PREVIEW_GAP;
      const top = Math.min(
        Math.max(itemRect.top - 4, 8),
        (typeof window !== "undefined" ? window.innerHeight : 800) - 180
      );
      setPreviewPos({ top, left });
    };
    raf = requestAnimationFrame(calc);
    return () => cancelAnimationFrame(raf);
  }, [activeId, open]);

  useEffect(() => {
    if (!open) return;
    let list: HTMLElement | null = null;
    let mo: MutationObserver | null = null;
    let raf = 0;
    const update = () => {
      requestAnimationFrame(() => {
        const l = list;
        if (!l) return;
        const sel = l.querySelector<HTMLElement>("[data-selected='true']");
        const id = sel?.getAttribute("data-action-id");
        if (id) setActiveId(id);
      });
    };
    const attach = () => {
      list = document.querySelector<HTMLElement>("[data-slot='command-list']");
      if (!list) {
        raf = requestAnimationFrame(attach);
        return;
      }
      update();
      list.addEventListener("keydown", update, true);
      mo = new MutationObserver(update);
      mo.observe(list, { attributes: true, subtree: true, attributeFilter: ["data-selected"] });
    };
    raf = requestAnimationFrame(attach);
    return () => {
      cancelAnimationFrame(raf);
      if (list) list.removeEventListener("keydown", update, true);
      mo?.disconnect();
    };
  }, [open]);

  const activeAction = visibleItems.find((i) => i.id === activeId);
  const preview = open && activeAction ? getPreview(activeAction.id) : null;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={<ToolbarBtn title="插入" onClick={() => {}} />}
        >
          <HandPlus className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 p-1">
          <Command className="p-0">
            <CommandInput
              placeholder="搜索要插入的内容…"
              className="h-8! pl-8! shadow-none! bg-transparent!"
              wrapperClassName="p-1! pb-1!"
              inputGroupClassName="border! border-hairline! bg-canvas-soft! shadow-none! rounded-md! h-8!"
              showDivider
            />
            <CommandList className="max-h-[420px] pt-0.5">
              <CommandEmpty>没有找到相关内容</CommandEmpty>
              {GROUPS.map((group) => (
                <CommandGroup key={group} heading={group}>
                  {items
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <CommandItem
                        key={item.id}
                        data-action-id={item.id}
                        value={`${item.label} ${item.description}`}
                        onSelect={() => {
                          item.run();
                          setOpen(false);
                        }}
                        onMouseEnter={() => setActiveId(item.id)}
                        className="flex-row! items-start! gap-2.5! py-2! px-2!"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline bg-canvas-soft text-ink-muted">
                          {item.icon}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13px] font-medium text-ink">{item.label}</span>
                            {item.shortcut && (
                              <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                                {item.shortcut}
                              </span>
                            )}
                          </span>
                          <span className="truncate text-[11.5px] leading-tight text-ink-faint">
                            {item.description}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DropdownMenuContent>
      </DropdownMenu>

      {open && preview && previewPos && typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-none z-[9998]"
              style={{
                position: "fixed",
                top: previewPos.top,
                left: previewPos.left,
                width: PREVIEW_WIDTH,
                transition: "top 0.08s ease-out",
              }}
            >
              <div className="overflow-hidden rounded-lg bg-ink p-2 shadow-lg">
                {preview.node}
                <div className="mt-1.5 px-1 pb-0.5 text-[11px] font-medium text-white/90">
                  {preview.title}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
