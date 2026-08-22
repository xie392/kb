function attrOf(attrs: string, name: string): string | null {
  const m = attrs.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"),
  );
  return m ? m[1] : null;
}

function fileIconClass(ext: string | null): string {
  if (!ext) return "kb-att-icon-file";
  const e = ext.toLowerCase();
  if (e === "pdf") return "kb-att-icon-pdf";
  if (["doc", "docx"].includes(e)) return "kb-att-icon-doc";
  if (["xls", "xlsx", "csv"].includes(e)) return "kb-att-icon-xls";
  if (["ppt", "pptx"].includes(e)) return "kb-att-icon-ppt";
  if (["zip", "rar", "7z", "tar", "gz"].includes(e)) return "kb-att-icon-zip";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(e)) return "kb-att-icon-video";
  if (["mp3", "wav", "flac", "aac"].includes(e)) return "kb-att-icon-audio";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(e)) return "kb-att-icon-img";
  if (["txt", "md", "markdown"].includes(e)) return "kb-att-icon-txt";
  return "kb-att-icon-file";
}

function normalizeFileSize(bytes: number | null): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function buildAttachmentCard(attrs: string): string {
  const fileName = attrOf(attrs, "data-filename") || "";
  const fileSize = Number(attrOf(attrs, "data-filesize")) || null;
  const fileExt = attrOf(attrs, "data-fileext");
  const url = attrOf(attrs, "data-url");
  if (!url) return "";
  const displayName = fileName && fileExt ? `${fileName}.${fileExt}` : fileName || "未命名文件";
  const iconClass = fileIconClass(fileExt);
  const sizeText = normalizeFileSize(fileSize);
  return (
    `<a class="kb-att-card" href="${url}" target="_blank" rel="noopener noreferrer" download="${displayName}">` +
    `<span class="kb-att-icon ${iconClass}" aria-hidden="true"></span>` +
    `<div class="kb-att-meta"><div class="kb-att-name" title="${displayName}">${displayName}</div>` +
    `<div class="kb-att-size">${sizeText}</div></div>` +
    `<div class="kb-att-actions"><span class="kb-att-btn">下载</span></div></a>`
  );
}

function buildIframeContent(attrs: string): string {
  const url = attrOf(attrs, "data-url");
  const width = attrOf(attrs, "data-width") || "100%";
  const height = Number(attrOf(attrs, "data-height")) || 360;
  if (!url) return "";
  return (
    `<div class="kb-iframe-inner" style="width:${width};height:${height}px">` +
    `<iframe src="${url}" class="kb-iframe-frame" title="iframe 嵌入" loading="lazy" ` +
    `sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation" ` +
    `allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`
  );
}

export function renderStaticNodes(html: string): string {
  let result = html;

  result = result.replace(
    /(<div\b[^>]*class=["'][^"']*\bkb-attachment\b[^"']*["'][^>]*>)\s*(<\/div>)/gi,
    (_match, openTag: string, closeTag: string) => {
      const card = buildAttachmentCard(openTag);
      return `${openTag}${card}${closeTag}`;
    },
  );

  result = result.replace(
    /(<div\b[^>]*class=["'][^"']*\bkb-iframe\b[^"']*["'][^>]*>)\s*(<\/div>)/gi,
    (_match, openTag: string, closeTag: string) => {
      const frame = buildIframeContent(openTag);
      return `${openTag}${frame}${closeTag}`;
    },
  );

  return result;
}
