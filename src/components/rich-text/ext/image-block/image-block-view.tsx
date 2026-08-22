"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";

/* ─── ImageBlock NodeView ───
 * 照搬 demo 的 layout 思路（width 百分比 + align 三态），
 * 在图片下方加就地可编辑的 caption（参考 demo Figcaption），
 * 右下角放拖拽手柄直接调宽度，避免每次都开浮层菜单。
 */

type Align = "left" | "center" | "right";

interface ImageBlockAttrs {
  src: string;
  width: string;
  align: Align;
  alt?: string;
  caption?: string | null;
}

export function ImageBlockView(props: NodeViewProps) {
  const { editor, node, updateAttributes, selected } = props;
  const attrs = node.attrs as unknown as ImageBlockAttrs;
  const { src, width, align, alt, caption } = attrs;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);

  // caption 进入编辑模式时同步初始文本
  useEffect(() => {
    if (editingCaption && captionRef.current) {
      captionRef.current.textContent = caption ?? "";
      captionRef.current.focus();
    }
  }, [editingCaption, caption]);

  const commitCaption = () => {
    setEditingCaption(false);
    const text = captionRef.current?.textContent ?? "";
    updateAttributes({ caption: text.trim() ? text : null });
  };

  const onHandleDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editor.isEditable) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = wrapRef.current?.getBoundingClientRect().width ?? 0;
      const containerW =
        wrapRef.current?.parentElement?.getBoundingClientRect().width ?? startW;
      const startPercent = (startW / containerW) * 100 || Number(width) || 100;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const next = Math.max(15, Math.min(100, startPercent + (dx / containerW) * 100));
        setDragWidth(Math.round(next));
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        setDragWidth((finalW) => {
          if (finalW !== null) updateAttributes({ width: `${finalW}%` });
          return null;
        });
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [editor.isEditable, width, updateAttributes],
  );

  const effectiveWidth = dragWidth ?? (Number(String(width).replace("%", "")) || 100);
  const wrapperAlign =
    align === "left" ? "ml-0 mr-auto" : align === "right" ? "ml-auto mr-0" : "mx-auto";

  return (
    <NodeViewWrapper className="kb-ib" data-align={align} data-selected={selected ? "true" : undefined}>
      <div
        ref={wrapRef}
        className={cn("relative block", wrapperAlign)}
        style={{ width: `${effectiveWidth}%`, maxWidth: "100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          className="block w-full h-auto rounded-xl"
          draggable={false}
        />
        {selected && editor.isEditable && (
          <span
            role="button"
            aria-label="拖拽调整宽度"
            title="拖拽调整宽度"
            onMouseDown={onHandleDown}
            className="kb-ib-handle"
          />
        )}
        {dragWidth !== null && (
          <span className="kb-ib-width-tag">{Math.round(effectiveWidth)}%</span>
        )}
      </div>

      {(editingCaption || caption) && (
        <div
          ref={captionRef}
          contentEditable={editor.isEditable && editingCaption}
          suppressContentEditableWarning
          data-placeholder="图片说明…"
          className={cn("kb-ib-caption", wrapperAlign)}
          style={{ width: `${effectiveWidth}%`, maxWidth: "100%" }}
          onBlur={commitCaption}
          onClick={(e) => {
            if (editor.isEditable && !editingCaption) {
              e.stopPropagation();
              setEditingCaption(true);
            }
          }}
        />
      )}
      {selected && editor.isEditable && !caption && !editingCaption && (
        <button
          type="button"
          className={cn("kb-ib-add-caption", wrapperAlign)}
          style={{ width: `${effectiveWidth}%`, maxWidth: "100%" }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            setEditingCaption(true);
          }}
        >
          + 添加说明
        </button>
      )}
    </NodeViewWrapper>
  );
}

export default ImageBlockView;
