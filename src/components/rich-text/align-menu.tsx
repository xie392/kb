"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarBtn } from "./toolbar";
import { IconAlignLeft, IconAlignCenter, IconAlignRight } from "./icons";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "left", label: "左对齐", icon: <IconAlignLeft /> },
  { key: "center", label: "居中", icon: <IconAlignCenter /> },
  { key: "right", label: "右对齐", icon: <IconAlignRight /> },
] as const;

export function AlignMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const active = OPTIONS.find((o) => editor.isActive({ textAlign: o.key })) ?? OPTIONS[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<ToolbarBtn title="对齐方式" active={open} onClick={() => {}} />}
      >
        {active.icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36 p-1">
        {OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.key}
            onSelect={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign(o.key).run();
              setOpen(false);
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] cursor-pointer",
              active.key === o.key && "bg-primary/10 text-primary"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center">{o.icon}</span>
            <span>{o.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
