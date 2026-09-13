/**
 * 写作模板：新建笔记时可一键套用的结构骨架。
 * content 为编辑器可解析的富文本 HTML（只用基础节点：h2/p/ul/blockquote）。
 */

export interface ArticleTemplate {
  id: string;
  name: string;
  hint: string;
  title: string;
  content: string;
}

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: "meeting",
    name: "会议记录",
    hint: "议题 → 讨论 → 结论 → 待办",
    title: "",
    content:
      "<h2>会议信息</h2><p><strong>时间：</strong></p><p><strong>参与人：</strong></p><p><strong>目标：</strong></p>" +
      "<h2>议题与讨论</h2><ul><li></li></ul>" +
      "<h2>结论</h2><blockquote><p></p></blockquote>" +
      "<h2>待办事项</h2><ul><li></li></ul>",
  },
  {
    id: "reading",
    name: "读书笔记",
    hint: "核心观点 → 摘录 → 我的思考",
    title: "",
    content:
      "<h2>书籍信息</h2><p><strong>书名：</strong></p><p><strong>作者：</strong></p>" +
      "<h2>核心观点</h2><ul><li></li></ul>" +
      "<h2>精彩摘录</h2><blockquote><p></p></blockquote>" +
      "<h2>我的思考</h2><p></p>",
  },
  {
    id: "weekly",
    name: "周报",
    hint: "本周完成 → 问题 → 下周计划",
    title: "",
    content:
      "<h2>本周完成</h2><ul><li></li></ul>" +
      "<h2>遇到的问题</h2><ul><li></li></ul>" +
      "<h2>下周计划</h2><ul><li></li></ul>",
  },
  {
    id: "retro",
    name: "项目复盘",
    hint: "背景 → 过程 → 结果 → 经验",
    title: "",
    content:
      "<h2>背景与目标</h2><p></p>" +
      "<h2>关键过程</h2><ul><li></li></ul>" +
      "<h2>结果与数据</h2><p></p>" +
      "<h2>可复用的经验</h2><ul><li></li></ul>",
  },
  {
    id: "daily",
    name: "每日记录",
    hint: "今天做了什么 → 收获 → 明天",
    title: "",
    content:
      "<h2>今天做了什么</h2><ul><li></li></ul>" +
      "<h2>收获与想法</h2><p></p>" +
      "<h2>明天要做</h2><ul><li></li></ul>",
  },
];
