/* ─── 编辑器内联 SVG 图标（不引入额外图标库） ─── */

export function IconUndo() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5a5 5 0 0 1 7-4.6V3l3.5 3L10 9V7A3 3 0 1 0 7 10H3v-.5z" />
    </svg>
  );
}

export function IconRedo() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 9.5a5 5 0 0 0-7-4.6V3l-3.5 3L6 9V7a3 3 0 1 1 3 3h4v-.5z" />
    </svg>
  );
}

export function IconBold() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2h5a3 3 0 0 1 2.1 5.1A3 3 0 0 1 9 14H4V2zm2.5 2v3h2a1 1 0 0 0 0-2h-2zm0 5v3h2.5a1.5 1.5 0 0 0 0-3H6.5z" />
    </svg>
  );
}

export function IconItalic() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2H6l-2 12h4" />
    </svg>
  );
}

export function IconUnderline() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v6a4 4 0 0 0 8 0V2M3 14h10" />
    </svg>
  );
}

export function IconStrike() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 8h12M5 5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5c0 1-1 1.8-2.5 2.5C7 8.2 5 9 5 11c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5" />
    </svg>
  );
}

export function IconCode() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 4-3 4 3 4M11 4l3 4-3 4" />
    </svg>
  );
}

export function IconH1() {
  return <span className="text-[12px] font-bold leading-none">H1</span>;
}
export function IconH2() {
  return <span className="text-[12px] font-bold leading-none">H2</span>;
}
export function IconH3() {
  return <span className="text-[12px] font-bold leading-none">H3</span>;
}
export function IconParagraph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 3h10v2H3zM3 7h7v2H3zM3 11h10v2H3z" opacity="0.7" />
    </svg>
  );
}

export function IconUl() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3.5" cy="4" r="1" /><circle cx="3.5" cy="8" r="1" /><circle cx="3.5" cy="12" r="1" />
      <rect x="7" y="3" width="7" height="2" rx="0.5" /><rect x="7" y="7" width="7" height="2" rx="0.5" /><rect x="7" y="11" width="7" height="2" rx="0.5" />
    </svg>
  );
}

export function IconOl() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" fontSize="7" fontFamily="sans-serif">
      <text x="2" y="5.5" fontWeight="bold">1</text><text x="2" y="9.5" fontWeight="bold">2</text><text x="2" y="13.5" fontWeight="bold">3</text>
      <rect x="7" y="3" width="7" height="2" rx="0.5" /><rect x="7" y="7" width="7" height="2" rx="0.5" /><rect x="7" y="11" width="7" height="2" rx="0.5" />
    </svg>
  );
}

export function IconQuote() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.7">
      <path d="M3 8c0-2 1-3.5 3-3.5V6c-1 0-1.5.8-1.5 2H6v4H3V8zm6 0c0-2 1-3.5 3-3.5V6c-1 0-1.5.8-1.5 2H12v4H9V8z" />
    </svg>
  );
}

export function IconHr() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2" y1="7" x2="14" y2="7" />
    </svg>
  );
}

export function IconImage() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
      <circle cx="5.5" cy="6.5" r="1.2" />
      <path d="M2.5 11l3.5-3 2.5 2 3-2.5L13.5 11" />
    </svg>
  );
}

export function IconLink() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10 9 7M7 3.5 8.5 2a3 3 0 0 1 4.2 4.2L11 8M9 12.5 7.5 14a3 3 0 0 1-4.2-4.2L5 8" />
    </svg>
  );
}

export function IconHighlight() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="8.5" width="12" height="4.5" rx="1.2" fill="currentColor" opacity="0.35" />
      <path d="M4 4.5h8M6 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconCodeBlock() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="m6 6-2 2 2 2M10 6l2 2-2 2" />
    </svg>
  );
}

export function IconTaskList() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2.8" width="3.4" height="3.4" rx="0.9" />
      <path d="M3.2 4.5l.9.9 1.4-1.6" />
      <rect x="7.5" y="3.2" width="6.5" height="1.7" rx="0.8" />
      <rect x="2" y="9.8" width="3.4" height="3.4" rx="0.9" />
      <rect x="7.5" y="10.4" width="6.5" height="1.7" rx="0.8" />
    </svg>
  );
}

export function IconAlignLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 3.5h12M2 7h8M2 10.5h11M2 14h5" />
    </svg>
  );
}

export function IconAlignCenter() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 3.5h12M4 7h8M3 10.5h10M5 14h6" />
    </svg>
  );
}

export function IconAlignRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 3.5h12M6 7h8M3 10.5h11M9 14h5" />
    </svg>
  );
}

export function IconClearFormat() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3h5M8 3v7.5M5.5 12h5.5" />
      <path d="M2.5 14l10.5-11" />
    </svg>
  );
}

export function IconSpinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8a6 6 0 1 1 11 3.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconDelete() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9M6.5 7.5v4M9.5 7.5v4" />
    </svg>
  );
}

export function IconRotate() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M13.5 2v3h-3" />
    </svg>
  );
}

export function IconImageStyle() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3.5" width="9" height="9" rx="1.5" />
      <circle cx="5.2" cy="6.2" r="0.9" />
      <path d="M2.5 10l2.5-2.2 2 1.6L10 6.5l1.5 1.5" />
    </svg>
  );
}

export function IconReset() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 4v3.5H7" />
      <path d="M3.9 10.5a5 5 0 1 0 .9-4.1L3.5 7.5" />
    </svg>
  );
}
