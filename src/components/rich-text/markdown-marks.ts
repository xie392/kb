import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import { safeMarkInputRule } from "./safe-mark-input-rule";

/* Tiptap 3.x 内置 markInputRule 在空段落场景下 tr.addMark 会因
 * 位置映射崩溃（"Cannot read properties of undefined (reading 'nodeSize')"），
 * 导致所有行内 markdown 输入规则失效。这里用 safeMarkInputRule 覆盖。
 * 正则与官方保持一致。 */

const boldStarRegex = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/;
const boldUnderscoreRegex = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/;
const italicStarRegex = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/;
const italicUnderscoreRegex = /(?:^|\s)(_(?!\s+)((?:[^_]+))_(?!\s+_))$/;
const strikeRegex = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/;

const codeInputMatch = (text: string) => {
  const match = /`([^`]+)`(?!`)$/.exec(text);
  if (!match) return null;
  if (match.index > 0 && text[match.index - 1] === "`") return null;
  return {
    index: match.index,
    text: match[0],
    replaceWith: match[1],
  };
};

export const CustomBold = Bold.extend({
  addInputRules() {
    return [
      safeMarkInputRule({ find: boldStarRegex, type: this.type }),
      safeMarkInputRule({ find: boldUnderscoreRegex, type: this.type }),
    ];
  },
});

export const CustomItalic = Italic.extend({
  addInputRules() {
    return [
      safeMarkInputRule({ find: italicStarRegex, type: this.type }),
      safeMarkInputRule({ find: italicUnderscoreRegex, type: this.type }),
    ];
  },
});

export const CustomStrike = Strike.extend({
  addInputRules() {
    return [safeMarkInputRule({ find: strikeRegex, type: this.type })];
  },
});

export const CustomCode = Code.extend({
  addInputRules() {
    return [safeMarkInputRule({ find: codeInputMatch, type: this.type })];
  },
});
