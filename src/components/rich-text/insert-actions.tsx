import type { Editor } from "@tiptap/react";
import {
  HandCode,
  HandCodeBlock,
  HandHeading,
  HandImage,
  HandLink,
  HandList,
  HandListOrdered,
  HandMinus,
  HandParagraph,
  HandQuote,
  HandTable,
  HandTaskList,
} from "./hand-icons";
import {
  HandColumnsTwo,
  HandDetails,
  HandToc,
  HandEmoji,
  HandCallout,
  HandIframe,
  HandMath,
  HandAttachment,
} from "./hand-icons-extra";
import { openLinkDialog } from "./link-dialog";

export interface InsertAction {
  id: string;
  group: "基础" | "结构" | "媒体";
  label: string;
  description: string;
  aliases?: string[];
  icon: React.ReactNode;
  run: () => void;
}

export interface SlashCommandState {
  active: boolean;
  query: string;
  from: number;
  to: number;
  key: string;
}

const INACTIVE_SLASH_COMMAND: SlashCommandState = {
  active: false,
  query: "",
  from: 0,
  to: 0,
  key: "",
};

/** 检测光标前是否为 "/关键词"（仅段落内生效） */
export function getSlashCommandState(editor: Editor): SlashCommandState {
  const { state } = editor;
  const { $anchor, empty } = state.selection;

  if (!empty || $anchor.depth !== 1) return INACTIVE_SLASH_COMMAND;

  const node = $anchor.parent;
  if (node.type.name !== "paragraph") return INACTIVE_SLASH_COMMAND;

  const textBeforeCursor = node.textBetween(0, $anchor.parentOffset, "\n", "\n");
  if (!textBeforeCursor.startsWith("/")) return INACTIVE_SLASH_COMMAND;

  const query = textBeforeCursor.slice(1);
  const from = $anchor.start();
  const to = from + textBeforeCursor.length;

  return { active: true, query, from, to, key: `${from}:${to}:${query}` };
}

function replaceSlashWithEmpty(editor: Editor) {
  const slash = getSlashCommandState(editor);
  if (!slash.active) return;
  editor.chain().focus().deleteRange({ from: slash.from, to: slash.to }).run();
}

export function filterInsertActions(actions: InsertAction[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return actions;
  const isSingleCjkQuery =
    normalizedQuery.length === 1 && /[一-鿿]/.test(normalizedQuery);

  return actions.filter((action) => {
    const label = action.label.toLowerCase();
    const aliases = action.aliases ?? [];

    if (isSingleCjkQuery) {
      return (
        label.startsWith(normalizedQuery) ||
        aliases.some((alias) => alias.toLowerCase() === normalizedQuery)
      );
    }

    const haystack = [label, action.description, action.id, ...aliases]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

interface GetInsertActionsOptions {
  editor: Editor;
  /** 有值时"图片"走本地文件选择 */
  openImagePicker?: () => void;
  /** 执行动作前删除 "/关键词" 文本（slash 菜单用） */
  clearSlashQuery?: boolean;
}

export function getInsertActions({
  editor,
  openImagePicker,
  clearSlashQuery = false,
}: GetInsertActionsOptions): InsertAction[] {
  const prepareInsert = () => {
    if (clearSlashQuery) replaceSlashWithEmpty(editor);
  };

  return [
    {
      id: "heading-1",
      group: "基础",
      label: "标题 1",
      description: "一级章节标题",
      aliases: ["h1", "biaoti1"],
      icon: <HandHeading level={1} className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    {
      id: "heading-2",
      group: "基础",
      label: "标题 2",
      description: "二级章节标题",
      aliases: ["h2", "biaoti2"],
      icon: <HandHeading level={2} className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      id: "heading-3",
      group: "基础",
      label: "标题 3",
      description: "三级章节标题",
      aliases: ["h3", "biaoti3"],
      icon: <HandHeading level={3} className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      },
    },
    {
      id: "heading-4",
      group: "基础",
      label: "标题 4",
      description: "四级章节标题",
      aliases: ["h4", "biaoti4"],
      icon: <HandHeading level={4} className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleHeading({ level: 4 }).run();
      },
    },
    {
      id: "heading-5",
      group: "基础",
      label: "标题 5",
      description: "五级章节标题",
      aliases: ["h5", "biaoti5"],
      icon: <HandHeading level={5} className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleHeading({ level: 5 }).run();
      },
    },
    {
      id: "heading-6",
      group: "基础",
      label: "标题 6",
      description: "六级章节标题",
      aliases: ["h6", "biaoti6"],
      icon: <HandHeading level={6} className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleHeading({ level: 6 }).run();
      },
    },
    {
      id: "paragraph",
      group: "基础",
      label: "正文",
      description: "普通段落",
      aliases: ["zhengwen", "p"],
      icon: <HandParagraph className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().setParagraph().run();
      },
    },
    {
      id: "bullet-list",
      group: "基础",
      label: "无序列表",
      description: "圆点列表",
      aliases: ["wuxu", "ul"],
      icon: <HandList className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleBulletList().run();
      },
    },
    {
      id: "ordered-list",
      group: "基础",
      label: "有序列表",
      description: "数字列表",
      aliases: ["youxu", "ol"],
      icon: <HandListOrdered className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleOrderedList().run();
      },
    },
    {
      id: "task-list",
      group: "基础",
      label: "任务列表",
      description: "待办勾选列表",
      aliases: ["renwu", "todo"],
      icon: <HandTaskList className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleTaskList().run();
      },
    },
    {
      id: "code-block",
      group: "结构",
      label: "代码块",
      description: "插入代码块",
      aliases: ["code", "daima"],
      icon: <HandCodeBlock className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleCodeBlock().run();
      },
    },
    {
      id: "blockquote",
      group: "结构",
      label: "引用",
      description: "突出一段引用",
      aliases: ["quote", "yinyong"],
      icon: <HandQuote className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().toggleBlockquote().run();
      },
    },
    {
      id: "horizontal-rule",
      group: "结构",
      label: "分割线",
      description: "分隔文档段落",
      aliases: ["hr", "line", "fengexian"],
      icon: <HandMinus className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().setHorizontalRule().run();
      },
    },
    {
      id: "table",
      group: "媒体",
      label: "表格",
      description: "插入 3 × 3 表格",
      aliases: ["biaoge", "table"],
      icon: <HandTable className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      id: "image",
      group: "媒体",
      label: "图片",
      description: openImagePicker ? "选择本地图片插入" : "输入图片 URL",
      aliases: ["tupian", "img"],
      icon: <HandImage className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        if (openImagePicker) {
          openImagePicker();
          return;
        }
        const url = window.prompt("图片 URL（或 base64 数据）");
        if (url) editor.chain().focus().setImageBlock({ src: url }).run();
      },
    },
    {
      id: "link",
      group: "媒体",
      label: "链接",
      description: "为选中文字添加链接",
      aliases: ["lianjie"],
      icon: <HandLink className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        openLinkDialog();
      },
    },
    {
      id: "columns",
      group: "媒体",
      label: "多栏布局",
      description: "两栏 / 侧栏布局",
      aliases: ["lan", "column", "cols"],
      icon: <HandColumnsTwo className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor
          .chain()
          .focus()
          .setColumns()
          .focus(editor.state.selection.head - 1)
          .run();
      },
    },
    {
      id: "details",
      group: "媒体",
      label: "折叠块",
      description: "可展开/收起的容器",
      aliases: ["zhedie", "toggle", "fold"],
      icon: <HandDetails className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().setDetails().run();
      },
    },
    {
      id: "toc",
      group: "媒体",
      label: "页面目录",
      description: "自动扫描标题生成目录",
      aliases: ["mulu", "outline", "catalog"],
      icon: <HandToc className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().insertTableOfContents().run();
      },
    },
    {
      id: "callout",
      group: "媒体",
      label: "提示框",
      description: "高亮信息 / 警告 / 备注（5 种风格）",
      aliases: ["tishi", "callout", "banner", "alert"],
      icon: <HandCallout className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().setCallout().run();
      },
    },
    {
      id: "iframe",
      group: "媒体",
      label: "嵌入网页",
      description: "B 站 / YouTube / 外部网页",
      aliases: ["qianru", "embed", "video", "shipin"],
      icon: <HandIframe className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().setIframe({ url: null }).run();
      },
    },
    {
      id: "katex",
      group: "媒体",
      label: "数学公式",
      description: "LaTeX 公式（块级）",
      aliases: ["gongshi", "math", "latex", "gongshi"],
      icon: <HandMath className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().setKatex({ text: "" }).run();
      },
    },
    {
      id: "attachment",
      group: "媒体",
      label: "附件",
      description: "上传文件并预览（PDF / Office / 压缩包等）",
      aliases: ["fujian", "file", "upload", "wenjian"],
      icon: <HandAttachment className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        editor.chain().focus().setAttachment().run();
      },
    },
    {
      id: "emoji",
      group: "媒体",
      label: "插入 emoji",
      description: "输入 : 触发或点此浏览",
      aliases: ["biaoqing", "face", "smile"],
      icon: <HandEmoji className="h-4 w-4" />,
      run: () => {
        prepareInsert();
        // 在光标处插入 :smile: 占位触发 emoji 建议
        editor.chain().focus().insertContent(":").run();
      },
    },
  ];
}
