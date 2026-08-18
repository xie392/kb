/* ─── 工具栏手绘风格图标集（与网站手绘线框风格统一） ───
 * 统一 16×16 viewBox、圆润笔触、轻微不规则的"手绘感"线条，
 * 颜色沿用 currentColor（由按钮状态控制，不硬编码色值）。
 */

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

/* ─── 插入 / 撤销 / 重做 ─── */

export function HandPlus(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.6c.2 2.6.1 6 .1 10.8M2.6 8c2.6-.2 6-.1 10.8-.1" />
    </Svg>
  );
}

export function HandUndo(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M3.6 9.4C3.4 6.3 5.2 4 8.2 3.7c2.7-.3 5 1.6 5.4 4.3" />
      <path d="M3.6 9.4V6.3M3.6 9.4h3.1" />
    </Svg>
  );
}

export function HandRedo(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M12.4 9.4c.2-3.1-1.6-5.4-4.6-5.7-2.7-.3-5 1.6-5.4 4.3" />
      <path d="M12.4 9.4V6.3M12.4 9.4H9.3" />
    </Svg>
  );
}

/* ─── 段落 / 标题 / 下拉箭头 ─── */

export function HandParagraph(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M6.2 2.3v11.4M6.2 2.6c3.6-.4 5 1.1 5 3.4s-1.5 3.3-5 3.6" />
    </Svg>
  );
}

export function HandHeading({ level, ...props }: HandIconProps & { level: number }) {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={props.className}
      aria-hidden="true"
    >
      <text
        x="1"
        y="11.5"
        fontSize="8"
        fontWeight="700"
        style={{ fontFamily: "inherit" }}
      >
        H
      </text>
      <text x="8.5" y="13.5" fontSize="5.5" fontWeight="700">
        {level}
      </text>
    </svg>
  );
}

export function HandChevronDown(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6c1.5 1.6 3 2.8 5 4.4 2-1.6 3.5-2.8 5-4.4" />
    </Svg>
  );
}

/* ─── 行内格式 ─── */

export function HandBold(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M6.2 2.2v11.6M6.2 2.6c3.6-.4 4.8 1.3 4.4 3-.3 1.4-1.4 2-2.6 2.4 1.5.3 2.7 1.2 2.7 2.9 0 1.9-1.6 3.1-4.5 3.1" />
    </Svg>
  );
}

export function HandItalic(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M9.6 2.4H7.4M7.8 2.2 5.6 13.8h2.4M4.8 13.8h6.4" />
    </Svg>
  );
}

export function HandUnderline(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M4 2.2v5.6c0 2.4 1.6 4 4 4s4-1.6 4-4V2.2M3.4 13.8h9.2" />
    </Svg>
  );
}

export function HandStrike(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M3.6 9.8c-.3 1.7 1.2 2.7 2.6 2.7 1.5 0 2.6-1.1 2.6-2.5 0-1.6-1.5-1.8-2.6-2.7-1.6-1.3-3.6-.7-3.6 1.4" />
      <path d="M9.2 5.3c.2-1.7 1.4-2.7 3-2.7 1.3 0 2.3.7 2.3 1.8M2.4 8h11.2" />
    </Svg>
  );
}

export function HandCode(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="m4.6 4.6-3 3.4 3 3.4M11.4 4.6l3 3.4-3 3.4" />
    </Svg>
  );
}

export function HandSuperscript(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M2.6 12.4 7 8.6M7 12.4 2.6 8.6" />
      <path d="M9.8 4.2c.3-1.4 3.4-2 3.4.4-.4 1.3-2.5 1.4-3.1 2.6M10.6 8.6h2.8M11.9 7.2v1.4M13.3 7.2v1.4" />
    </Svg>
  );
}

export function HandSubscript(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M2.6 12.4 7 8.6M7 12.4 2.6 8.6" />
      <path d="M10.6 2.8h2.8M11.9 2.8v1.6M13.3 2.8v1.6M10.6 4.4h2.8M11 5.8h1.4M9.6 6.6h4.2" />
    </Svg>
  );
}

/* ─── 颜色 ─── */

export function HandPalette(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.4c-3.2 0-5.8 2.5-5.8 5.6 0 1.8.8 3 2.2 3 .9 0 1.3-.5 2-.5s1 .5 1 1.3c0 1.1 1 2 2.3 2 2.4 0 4.1-1.6 4.1-4.9C13.8 4.3 11.2 2.4 8 2.4z" />
      <path d="M5.2 5.6h.01M9 5.2h.01M10.9 7.6h.01" strokeWidth="2" />
    </Svg>
  );
}

export function HandHighlighter(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M4.4 9 7 6.4l5.4 5.4-2.6 2.6z" />
      <path d="M6.2 7.2 9 10M2.8 13.6h6.4M9.6 3.6 12.4 6.4M10.4 2.8l2.8 2.8" />
    </Svg>
  );
}

/* ─── 列表与缩进 ─── */

export function HandList(props: HandIconProps) {
  return (
    <Svg {...props}>
      <circle cx="3.4" cy="4" r="1.05" />
      <circle cx="3.4" cy="8" r="1.05" />
      <circle cx="3.4" cy="12" r="1.05" />
      <path d="M7 3.4h6M7 7.4h6M7 11.4h6" />
    </Svg>
  );
}

export function HandListOrdered(props: HandIconProps) {
  return (
    <Svg {...props}>
      <text x="1.4" y="5.6" fontSize="5.6" fontWeight="700" style={{ fontFamily: "inherit" }}>
        1
      </text>
      <text x="1.2" y="9.6" fontSize="5.6" fontWeight="700" style={{ fontFamily: "inherit" }}>
        2
      </text>
      <text x="1.2" y="13.6" fontSize="5.6" fontWeight="700" style={{ fontFamily: "inherit" }}>
        3
      </text>
      <path d="M7 3.4h6M7 7.4h6M7 11.4h6" />
    </Svg>
  );
}

export function HandTaskList(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2.8" width="3.2" height="3.2" rx="0.7" />
      <path d="M3.2 4.4l.9.9 1.4-1.6" />
      <rect x="2" y="6.8" width="3.2" height="3.2" rx="0.7" />
      <path d="M3.2 8.4l.9.9 1.4-1.6" />
      <rect x="2" y="10.8" width="3.2" height="3.2" rx="0.7" />
      <path d="M3.2 12.4l.9.9 1.4-1.6" />
    </Svg>
  );
}

export function HandIndentDecrease(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M2.4 3.4h11.2M2.4 7h7M2.4 10.6h11.2M2.4 14h7" />
      <path d="M11.4 6.4 9 8l2.4 1.6" />
    </Svg>
  );
}

export function HandIndentIncrease(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M2.4 3.4h11.2M2.4 7h7M2.4 10.6h11.2M2.4 14h7" />
      <path d="M4.6 6.4 7 8l-2.4 1.6" />
    </Svg>
  );
}

/* ─── 块级 ─── */

export function HandQuote(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M4.6 8.6c-.2 1.5.9 2.6 2.4 2.6v-3H4.6zm6 0c-.2 1.5.9 2.6 2.4 2.6v-3h-2.4z" />
    </Svg>
  );
}

export function HandMinus(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M2.4 8h11.2" />
    </Svg>
  );
}

export function HandCodeBlock(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2.2" y="2.4" width="11.6" height="11.2" rx="1.6" />
      <path d="m5.8 6-2 2 2 2M10.2 6l2 2-2 2" />
    </Svg>
  );
}

export function HandEraser(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="m9.4 3.4 3.2 3.2-5.4 5.6H3.6c-.8 0-1.3-.6-1.3-1.4 0-.4.1-.7.4-1L9.4 3.4z" />
      <path d="M2.8 13.4h10.4M7 10.6l2.6 2.6" />
    </Svg>
  );
}

/* ─── 媒体 ─── */

export function HandImage(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2.4" y="3.4" width="11.2" height="9.2" rx="1.6" />
      <circle cx="5.6" cy="6.4" r="1.2" />
      <path d="M2.6 11 6 7.6l2 2 2.4-2.4 3 3" />
    </Svg>
  );
}

export function HandLink(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M6 10 10 6" />
      <path d="M7 3.6 8.6 2a3 3 0 0 1 4.2 4.2L11.2 7.4" />
      <path d="M9 12.4 7.4 14a3 3 0 0 1-4.2-4.2L4.8 8.6" />
    </Svg>
  );
}

export function HandUnlink(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M6 10 10 6" />
      <path d="M7 3.6 8.6 2a3 3 0 0 1 4.2 4.2L11.2 7.4" />
      <path d="M9 12.4 7.4 14a3 3 0 0 1-4.2-4.2L4.8 8.6" />
      <path d="M2.8 3.2l10.4 10" />
    </Svg>
  );
}

export function HandExternalLink(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="M13.4 9.6V13.4H2.6V2.6h3.8" />
      <path d="M7 9 13 3M9.4 2.6h3.8v3.8" />
    </Svg>
  );
}

export function HandPencil(props: HandIconProps) {
  return (
    <Svg {...props}>
      <path d="m10.8 2.8 2.4 2.4L6 12.4 3.2 13l.6-2.8z" />
      <path d="M9.6 4 12 6.4M3.8 12.2l1.6.4" />
    </Svg>
  );
}

export function HandTable(props: HandIconProps) {
  return (
    <Svg {...props}>
      <rect x="2.4" y="2.6" width="11.2" height="10.8" rx="1.4" />
      <path d="M5.6 2.8v10.4M9.6 2.8v10.4M2.6 6.4h10.8M2.6 9.6h10.8" />
    </Svg>
  );
}
