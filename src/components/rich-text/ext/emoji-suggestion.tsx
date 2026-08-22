"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FloatingMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { EmojiGrid } from "./emoji-grid";
import { emojisToName } from "./emoji-data";

interface EmojiSuggestionState {
  active: boolean;
  query: string;
  from: number;
  to: number;
}

const INACTIVE: EmojiSuggestionState = {
  active: false,
  query: "",
  from: 0,
  to: 0,
};

const COLS = 8;

export function getEmojiSuggestionState(editor: Editor): EmojiSuggestionState {
  const { state } = editor;
  const { $anchor, empty } = state.selection;
  if (!empty) return INACTIVE;

  const node = $anchor.parent;
  if (!node.isTextblock) return INACTIVE;

  const textBefore = node.textBetween(0, $anchor.parentOffset, "\n", "\n");
  const match = textBefore.match(/(^|\s):([a-z0-9_+-]*)$/i);
  if (!match) return INACTIVE;

  const query = match[2];
  const colonOffset = match.index! + match[1].length;
  const from = $anchor.start() + colonOffset;
  const to = $anchor.pos;

  return { active: true, query, from, to };
}

export function EmojiSuggestion({ editor }: { editor: Editor | null }) {
  const [state, setState] = useState<EmojiSuggestionState>(INACTIVE);
  const [activeIndex, setActiveIndex] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      setState(getEmojiSuggestionState(editor));
      setActiveIndex(0);
    };
    sync();
    editor.on("update", sync);
    editor.on("selectionUpdate", sync);
    return () => {
      editor.off("update", sync);
      editor.off("selectionUpdate", sync);
    };
  }, [editor]);

  const insert = useCallback(
    (emoji: string) => {
      if (!editor) return;
      const current = stateRef.current;
      if (!current.active) return;
      editor
        .chain()
        .focus()
        .deleteRange({ from: current.from, to: current.to })
        .insertContent(emoji + " ")
        .run();
    },
    [editor],
  );

  const filteredCount = state.query
    ? emojisToName.filter((e) => e.name.includes(state.query)).length
    : emojisToName.length;

  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const current = stateRef.current;
      if (!current.active || filteredCount === 0) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % filteredCount);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + filteredCount) % filteredCount);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + COLS, filteredCount - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - COLS, 0));
      } else if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const items = state.query
          ? emojisToName.filter((e) => e.name.includes(state.query))
          : emojisToName;
        insert(items[Math.min(activeIndex, items.length - 1)].emoji);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setState(INACTIVE);
      }
    };
    editor.view.dom.addEventListener("keydown", handleKeyDown, true);
    return () => editor.view.dom.removeEventListener("keydown", handleKeyDown, true);
  }, [activeIndex, filteredCount, editor, insert, state.query]);

  if (!editor) return null;

  return (
    <FloatingMenu
      editor={editor}
      options={{ placement: "bottom-start", offset: 4 }}
      className="z-50 w-72 rounded-lg border border-hairline bg-white p-2 sketch-border sketch-shadow"
      shouldShow={({ editor: ed }) => getEmojiSuggestionState(ed).active}
    >
      <EmojiGrid
        query={state.query}
        onSelect={insert}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    </FloatingMenu>
  );
}

export default EmojiSuggestion;
