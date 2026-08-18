export interface LinkPreviewData {
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
}

/** 请求服务端抓取链接的标题/描述/缩略图（失败返回 null，不抛错） */
export async function fetchLinkPreview(url: string): Promise<LinkPreviewData | null> {
  try {
    const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data: LinkPreviewData & { error?: string } = await res.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}
