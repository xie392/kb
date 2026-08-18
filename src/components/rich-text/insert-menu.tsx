"use client";

import { useMemo, useState } from "react";
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
import { HandPlus } from "./hand-icons";
import { ToolbarBtn } from "./toolbar";

interface InsertMenuProps {
  editor: Editor;
  /** 有值时"图片"走本地文件选择，否则用 URL 输入 */
  openImagePicker?: () => void;
}

const GROUPS = ["基础", "结构", "媒体"] as const;

export function InsertMenu({ editor, openImagePicker }: InsertMenuProps) {
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => (editor ? getInsertActions({ editor, openImagePicker }) : []),
    [editor, openImagePicker]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<ToolbarBtn title="插入" onClick={() => {}} />}
      >
        <HandPlus className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="搜索要插入的内容…" />
          <CommandList className="max-h-96">
            <CommandEmpty>没有找到相关内容</CommandEmpty>
            {GROUPS.map((group) => (
              <CommandGroup key={group} heading={group}>
                {items
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${item.description}`}
                      onSelect={() => {
                        item.run();
                        setOpen(false);
                      }}
                    >
                      <span className="text-ink-muted">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs text-ink-muted/70">{item.description}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
