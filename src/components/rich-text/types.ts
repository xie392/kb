import type { ReactNode } from "react";

/** 图片对齐方式 */
export type ImageAlign = "left" | "center" | "right";

/** 图片视觉样式（none=无 / border=描边 / shadow=阴影） */
export type ImageStyle = "none" | "border" | "shadow";

/** 图片节点属性 */
export interface ImageAttrs {
  src?: string;
  alt?: string;
  title?: string;
  /** 原始像素宽度（用于旋转包围盒计算） */
  width?: number | null;
  /** 原始像素高度（用于旋转包围盒计算） */
  height?: number | null;
  align?: ImageAlign;
  rotation?: number;
  imgStyle?: ImageStyle;
  /** 显示宽度百分比 0-100，null 表示撑满容器（默认 100） */
  displayWidth?: number | null;
  /** 图片说明文字（caption） */
  caption?: string | null;
}

/** 标题大纲项（供外部渲染目录） */
export interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

/** 工具栏按钮定义（buildToolbarGroups 产出的统一结构） */
export interface ToolbarAction {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
}
