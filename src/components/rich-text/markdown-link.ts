import { Link as BuiltInLink } from "@tiptap/extension-link";
import { safeMarkInputRule } from "./safe-mark-input-rule";

/* Markdown 链接输入规则（用 safeMarkInputRule 规避 addMark 崩溃）：
 *   [文字](https://...) → 链接
 *   https://xxx / www.xxx → 裸 URL 自动加链接（行尾空格触发）
 * 中文友好：链接文字允许中文、字母、数字、空格、-、_、/。
 */

// [文字](url) → 捕获组 1=文字、2=url
const markdownLinkRegex =
  /(?:^|\s)\[([\w\u4e00-\u9fa5\s\-_/|]+)\]\((https?:\/\/\S+?)\)$/gm;

// 裸 URL：捕获组 1=url
const urlRegex = /(?:^|\s)((?:https?:\/\/|www\.)[^\s]+)(?:\s|\n)$/gim;

const getMarkdownLinkAttrs = (match: RegExpMatchArray) => {
  const href = match[2];
  match.pop();
  return { href };
};

const getUrlAttrs = (match: RegExpMatchArray) => ({ href: match[1] });

export const MarkdownLink = BuiltInLink.extend({
  addInputRules() {
    return [
      safeMarkInputRule({
        find: markdownLinkRegex,
        type: this.type,
        getAttributes: getMarkdownLinkAttrs as never,
      }),
      safeMarkInputRule({
        find: urlRegex,
        type: this.type,
        getAttributes: getUrlAttrs as never,
      }),
    ];
  },
}).configure({
  openOnClick: false,
  linkOnPaste: true,
  autolink: true,
  defaultProtocol: "https",
  HTMLAttributes: {
    rel: "noopener noreferrer nofollow",
  },
});
