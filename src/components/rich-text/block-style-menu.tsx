"use client";

import type { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HandChevronDown, HandHeading, HandParagraph } from "./hand-icons";
import { ToolbarBtn } from "./toolbar";

interface BlockStyleMenuProps {
  editor: Editor;
}

interface BlockStyle {
  label: string;
  icon: React.ReactNode;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

export const BLOCK_STYLES: BlockStyle[] = [
  {
    label: "正文",
    icon: <HandParagraph className="h-4 w-4" />,
    isActive: (editor) => editor.isActive("paragraph"),
    run: (editor) => editor.chain().focus().setParagraph().run(),
  },
  ...([1, 2, 3, 4, 5, 6] as const).map((level) => ({
    label: `标题 ${level}`,
    icon: <HandHeading level={level} className="h-4 w-4" />,
    isActive: (editor: Editor) => editor.isActive("heading", { level }),
    run: (editor: Editor) => editor.chain().focus().toggleHeading({ level }).run(),
  })),
];

export function BlockStyleMenu({ editor }: BlockStyleMenuProps) {
  const activeStyle =
    BLOCK_STYLES.find((item) => item.isActive(editor)) ?? BLOCK_STYLES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ToolbarBtn title="块样式" onClick={() => {}} className="w-fit px-2">
            <span className="flex items-center gap-1 text-[12px]">
              {activeStyle.icon}
              <span className="truncate">{activeStyle.label}</span>
              <HandChevronDown className="h-3.5 w-3.5 opacity-60" />
            </span>
          </ToolbarBtn>
        }
      />
      <DropdownMenuContent align="start" className="w-36">
        {BLOCK_STYLES.map((item) => (
          <DropdownMenuItem key={item.label} onClick={() => item.run(editor)}>
            <span className="mr-2 text-ink-muted">{item.icon}</span>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
