import type { Editor } from "@tiptap/react";
import { getMarkRange } from "@tiptap/core";
import type { LinkCardAttrs } from "./link-card";
import { fetchLinkPreview } from "./link-preview";

/** 文字链接 → 卡片：自动尝试抓取标题/描述/缩略图 */
export async function turnLinkToCard(editor: Editor): Promise<void> {
  const { selection } = editor.state;
  const range = getMarkRange(
    editor.state.doc.resolve(selection.from),
    editor.schema.marks.link
  );
  if (!range) return;

  const href = editor.getAttributes("link").href as string | undefined;
  if (!href) return;

  const text = editor.state.doc.textBetween(range.from, range.to, "\n", " ");

  let title = text;
  let description = "";
  let image: string | null = null;
  let favicon: string | null = null;
  const preview = await fetchLinkPreview(href);
  if (preview) {
    title = preview.title || text;
    description = preview.description;
    image = preview.image;
    favicon = preview.favicon;
  }

  editor
    .chain()
    .focus()
    .deleteRange(range)
    .insertContent({
      type: "linkCard",
      attrs: { href, title, description, image, favicon },
    })
    .run();
}

/** 卡片 → 文字链接：还原为带链接的普通文本 */
export function turnCardToLink(editor: Editor, pos: number, attrs: LinkCardAttrs): void {
  const { href, title } = attrs;
  editor
    .chain()
    .focus()
    .deleteRange({ from: pos, to: pos + 1 })
    .insertContent({
      type: "text",
      text: title || href,
      marks: [{ type: "link", attrs: { href } }],
    })
    .run();
}
