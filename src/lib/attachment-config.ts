// 附件管理共享配置：大小限制、图片类型、危险扩展名黑名单。
// 本文件仅含纯常量/纯函数，可在前后端共享引用（不引入任何 node 依赖）。

/** 附件大小限制：图片与其它文件分别限制 */
export const ATTACH_LIMITS = {
  /** 图片上限 5MB */
  image: { maxBytes: 5 * 1024 * 1024, label: "5MB" },
  /** 其它文件上限 20MB */
  file: { maxBytes: 20 * 1024 * 1024, label: "20MB" },
} as const;

/** 允许的图片扩展名（配合服务端魔数校验，防止伪装文件） */
export const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"] as const;

/** 危险扩展名黑名单：可执行文件 / 脚本 / 网页 / SVG 等，一律禁止上传 */
export const DANGEROUS_EXTS = [
  // 可执行程序
  "exe", "com", "cmd", "bat", "scr", "dll", "sys", "msi", "msp",
  "ocx", "cpl", "cab", "inf", "reg", "lnk", "apk", "app", "dmg",
  "pkg", "deb", "rpm", "iso", "img",
  // 脚本 / 服务端代码
  "sh", "bash", "zsh", "csh", "ksh", "fish", "py", "pl", "rb",
  "php", "asp", "aspx", "jsp", "js", "mjs", "vbs", "vbe", "wsh", "ps1",
  "jar", "war", "class",
  // 网页 / 可内嵌脚本的文本格式
  "html", "htm", "shtml", "xhtml", "svg",
  // 二进制 / 其它
  "bin", "so", "dylib", "wasm", "node", "elf",
] as const;

/** 根据扩展名判断附件类型：图片 / 普通文件 / 拒绝 */
export function classifyExt(ext: string): "image" | "file" | "reject" {
  const e = ext.toLowerCase();
  if ((IMAGE_EXTS as readonly string[]).includes(e)) return "image";
  if ((DANGEROUS_EXTS as readonly string[]).includes(e)) return "reject";
  return "file";
}
