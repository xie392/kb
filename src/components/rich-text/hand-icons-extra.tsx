/* ─── 工具栏手绘风格图标集（扩展，与 hand-icons 配套使用） ─── */

interface HandIconProps {
  size?: number;
  className?: string;
}

function Svg({
  children,
  size = 16,
  className,
}: HandIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* 左侧栏布局：左小右大 */
export function HandPanelLeft(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2.5" width="12" height="11" rx="1.2" />
      <path d="M6 2.5v11" />
    </Svg>
  );
}

/* 右侧栏布局：左大右小 */
export function HandPanelRight(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2.5" width="12" height="11" rx="1.2" />
      <path d="M10 2.5v11" />
    </Svg>
  );
}

/* 两栏平分 */
export function HandColumnsTwo(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2.5" width="12" height="11" rx="1.2" />
      <path d="M8 2.5v11" />
    </Svg>
  );
}

/* 删除（垃圾桶） */
export function HandTrash(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.5 8.5h6l.5-8.5M6.5 7v3.5M9.5 7v3.5" />
    </Svg>
  );
}

/* 折叠块（chevron + 内容线） */
export function HandDetails(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M5 4.5 7 6.5 5 8.5" />
      <path d="M9 4.5h3M9 7h3M3 10h9M3 12.5h9" />
    </Svg>
  );
}

/* 目录 */
export function HandToc(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 3.5h6M11 3.5h2.5M2.5 8h6M11 8h2.5M2.5 12.5h6M11 12.5h2.5" />
      <circle cx="9.5" cy="3.5" r="0.4" fill="currentColor" />
      <circle cx="9.5" cy="8" r="0.4" fill="currentColor" />
      <circle cx="9.5" cy="12.5" r="0.4" fill="currentColor" />
    </Svg>
  );
}

/* emoji 笑脸 */
export function HandEmoji(props: HandIconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="6" />
      <circle cx="6" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M5.5 9.5c1 1.4 4 1.4 5 0" />
    </Svg>
  );
}

/* 字体（带 A 字样） */
export function HandFontFamily(props: HandIconProps) {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={props.className}
      aria-hidden="true"
    >
      <text x="2.5" y="12" fontSize="9" fontWeight="700" style={{ fontFamily: "inherit" }}>
        Aa
      </text>
    </svg>
  );
}

/* 字号（大小 A） */
export function HandFontSize(props: HandIconProps) {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={props.className}
      aria-hidden="true"
    >
      <text x="1.5" y="13" fontSize="11" fontWeight="700" style={{ fontFamily: "inherit" }}>
        A
      </text>
      <text x="9.5" y="13" fontSize="6" fontWeight="700" style={{ fontFamily: "inherit" }}>
        a
      </text>
    </svg>
  );
}

/* 字数统计（ABC 计数） */
export function HandCharCount(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="12" height="10" rx="1.2" />
      <path d="M5 6.5h2.5M5 9.5h2.5M5 12h2.5" strokeWidth="1.3" />
      <path d="M10 6.5h2.5M10 9.5h2.5" strokeWidth="1.3" />
    </Svg>
  );
}

/* 双引号（用于 figcaption/blockquote 标记） */
export function HandQuoteCaption(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M3 4.5h10v6.5H8l-2.5 2v-2H3z" />
      <path d="M5.5 7h5M5.5 8.8h3" />
    </Svg>
  );
}

/* 上移 / 下移（details 内部用） */
export function HandChevronUp(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M3 10c1.5-1.6 3-2.8 5-4.4 2 1.6 3.5 2.8 5 4.4" />
    </Svg>
  );
}

/* 提示框 callout：带边框的小卡片 + 感叹号 */
export function HandCallout(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="12" height="10" rx="1.2" />
      <path d="M8 6.2v2.4M8 10v0.4" strokeWidth="1.6" />
    </Svg>
  );
}

/* iframe 嵌入：浏览器窗口 + 链接 */
export function HandIframe(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="12" height="10" rx="1.2" />
      <path d="M2 6h12M4 4.6h0.01M5.6 4.6h0.01M7.2 4.6h0.01" strokeWidth="1.2" />
      <path d="M5 9.5h6M5 11h3" strokeWidth="1.2" />
    </Svg>
  );
}

/* 数学公式：Σ 符号 */
export function HandMath(props: HandIconProps) {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={props.className}
      aria-hidden="true"
    >
      <text x="2.5" y="12.5" fontSize="11" fontWeight="700" style={{ fontFamily: "inherit" }}>
        Σ
      </text>
    </svg>
  );
}

/* 附件：回形针 */
export function HandAttachment(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M11.5 4.2 6 9.7c-1 1-1 2.4 0 3.4s2.4 1 3.4 0l4.5-4.5c.6-.6.6-1.6 0-2.2s-1.6-.6-2.2 0l-4 4c-.3.3-.3.8 0 1.1s.8.3 1.1 0" />
    </Svg>
  );
}
