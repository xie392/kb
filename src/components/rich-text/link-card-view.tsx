"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HandExternalLink, HandLink, HandPencil, HandUnlink } from "./hand-icons";
import { openLinkDialog } from "./link-dialog";
import { turnCardToLink } from "./link-convert";
import type { LinkCardAttrs } from "./link-card";

function CardActionBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
          >
            {children}
          </button>
        }
      />
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

/* 编辑器内的链接卡片视图：展示 Logo/缩略图 + 标题/描述/URL + 操作按钮 */
export function LinkCardView(props: NodeViewProps) {
  const { node, editor, selected } = props;
  const { href, title, description, image, favicon } = node.attrs as LinkCardAttrs;

  const selectNode = () => {
    const pos = props.getPos();
    if (typeof pos === "number") {
      editor.chain().focus().setNodeSelection(pos).run();
    }
  };

  const turnToText = () => {
    const pos = props.getPos();
    if (typeof pos === "number") {
      turnCardToLink(editor, pos, node.attrs as LinkCardAttrs);
    }
  };

  return (
    <NodeViewWrapper
      as="div"
      className={`my-3 kb-link-card ${selected ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="kb-link-card-inner" onClick={selectNode}>
        {image ? (
          <img className="kb-link-card-thumb" src={image} alt={title} />
        ) : favicon ? (
          <img className="kb-link-card-logo" src={favicon} alt="" />
        ) : (
          <span className="kb-link-card-thumb kb-link-card-thumb--empty">
            <HandExternalLink className="h-5 w-5" />
          </span>
        )}
        <div className="kb-link-card-body">
          <div className="kb-link-card-title">{title || href}</div>
          {description ? <div className="kb-link-card-desc">{description}</div> : null}
          <div className="kb-link-card-url">{href}</div>
        </div>
      </div>
      {selected && (
        <TooltipProvider delay={100}>
          <div className="kb-link-card-actions">
            <CardActionBtn
              title="编辑卡片"
              onClick={() => openLinkDialog({ card: node.attrs as LinkCardAttrs })}
            >
              <HandPencil className="h-3.5 w-3.5" />
            </CardActionBtn>
            <CardActionBtn title="转为文字链接" onClick={turnToText}>
              <HandLink className="h-3.5 w-3.5" />
            </CardActionBtn>
            <CardActionBtn
              title="打开链接"
              onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
            >
              <HandExternalLink className="h-3.5 w-3.5" />
            </CardActionBtn>
            <CardActionBtn
              title="移除"
              onClick={() => editor.chain().focus().deleteSelection().run()}
            >
              <HandUnlink className="h-3.5 w-3.5" />
            </CardActionBtn>
          </div>
        </TooltipProvider>
      )}
    </NodeViewWrapper>
  );
}
