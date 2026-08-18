import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

/**
 * 备份领域逻辑（服务端专用）。
 * 备份内容为 JSON 全量数据（文章/分类/标签/附件元数据），不含账号与附件二进制文件。
 * 备份目录由 BACKUP_DIR 控制（默认 <项目根>/backups），生产建议指向持久化数据卷。
 */

export const BACKUP_VERSION = 1;

/** 备份目录：通过 BACKUP_DIR 配置；相对路径以项目根为基准，也支持绝对路径 */
export function getBackupDir(): string {
  const raw = process.env.BACKUP_DIR?.trim();
  const dir = raw || "backups";
  return path.isAbsolute(dir) ? path.normalize(dir) : path.join(process.cwd(), dir);
}

/** 最大保留份数：通过 BACKUP_MAX_KEEP 配置（默认 30），超出自动清理旧备份 */
function getMaxKeep(): number {
  const raw = Number(process.env.BACKUP_MAX_KEEP ?? 30);
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 30;
}

// ===== 文件命名与时间解析 =====

function backupFilename(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(
    d.getHours()
  )}${p(d.getMinutes())}${p(d.getSeconds())}.json`;
}

/** 从备份文件名解析时间；格式不符返回 null（用于过滤非备份文件与防路径穿越） */
function parseBackupTimestamp(name: string): Date | null {
  const m = name.match(
    /^backup-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/
  );
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ===== 全量数据构建 =====

export interface BackupMeta {
  name: string;
  createdAt: string;
  size: number;
}

/** 构建全量备份数据（与设置页"一键导出"共用同一份输出） */
export async function buildBackupPayload(db: PrismaClient) {
  const [articles, categories, tags, attachments] = await Promise.all([
    db.article.findMany({
      include: { tags: { select: { tag: { select: { name: true } } } } },
    }),
    db.category.findMany(),
    db.tag.findMany(),
    db.attachment.findMany(),
  ]);
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    articles: articles.map((a) => ({
      ...a,
      tagNames: a.tags.map((t) => t.tag.name),
      tags: undefined,
    })),
    categories,
    tags,
    attachments,
  };
}

/** 立即创建一份备份并落盘，返回备份元信息 */
export async function createBackup(db: PrismaClient): Promise<BackupMeta> {
  const dir = getBackupDir();
  await fs.mkdir(dir, { recursive: true });
  const payload = await buildBackupPayload(db);
  const name = backupFilename(new Date());
  await fs.writeFile(
    path.join(dir, name),
    JSON.stringify(payload, null, 2),
    "utf8"
  );
  await pruneBackups(dir);
  const stat = await fs.stat(path.join(dir, name));
  return { name, createdAt: payload.exportedAt, size: stat.size };
}

/** 保留最近 maxKeep 份，清理更早的备份文件 */
async function pruneBackups(dir: string): Promise<void> {
  const entries = await fs.readdir(dir).catch(() => [] as string[]);
  const backups = entries
    .map((name) => ({ name, ts: parseBackupTimestamp(name)?.getTime() ?? 0 }))
    .filter((b) => b.ts > 0)
    .sort((a, b) => b.ts - a.ts);
  await Promise.all(
    backups
      .slice(getMaxKeep())
      .map((b) => fs.rm(path.join(dir, b.name)).catch(() => {}))
  );
}

// ===== 列表 / 读取 / 删除 =====

export interface ListBackupsInput {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export async function listBackups(input: ListBackupsInput): Promise<{
  items: BackupMeta[];
  total: number;
}> {
  const dir = getBackupDir();
  const entries = await fs.readdir(dir).catch(() => [] as string[]);
  const items: BackupMeta[] = [];
  for (const name of entries) {
    const ts = parseBackupTimestamp(name);
    if (!ts) continue;
    if (input.keyword && !name.includes(input.keyword)) continue;
    const stat = await fs.stat(path.join(dir, name)).catch(() => null);
    items.push({ name, createdAt: ts.toISOString(), size: stat?.size ?? 0 });
  }
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length };
}

/** 读取并解析备份文件（限制文件名防路径穿越） */
export async function readBackup(name: string): Promise<unknown> {
  const base = path.basename(name);
  if (!parseBackupTimestamp(base)) {
    throw new Error("非法备份文件名");
  }
  const raw = await fs.readFile(path.join(getBackupDir(), base), "utf8");
  return JSON.parse(raw);
}

/** 删除指定备份文件 */
export async function deleteBackup(name: string): Promise<void> {
  const base = path.basename(name);
  if (!parseBackupTimestamp(base)) {
    throw new Error("非法备份文件名");
  }
  await fs.rm(path.join(getBackupDir(), base));
}

// ===== 自动备份计划 =====

export const scheduleSchema = z.object({
  enabled: z.boolean().default(false),
  /** 每天执行时间，格式 HH:mm（24 小时制） */
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "时间格式应为 HH:mm")
    .default("02:00"),
  /** 执行周期（天）：1 = 每天，7 = 每周 */
  everyDays: z.number().int().min(1).max(30).default(1),
});
export type BackupSchedule = z.infer<typeof scheduleSchema>;

const scheduleFile = () => path.join(getBackupDir(), "schedule.json");

export async function loadSchedule(): Promise<BackupSchedule> {
  try {
    const raw = await fs.readFile(scheduleFile(), "utf8");
    return scheduleSchema.parse(JSON.parse(raw));
  } catch {
    return scheduleSchema.parse({});
  }
}

export async function saveSchedule(s: BackupSchedule): Promise<void> {
  const dir = getBackupDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(scheduleFile(), JSON.stringify(s, null, 2), "utf8");
}

/** 最近一份备份的时间戳（无备份返回 0） */
async function getLatestBackupTime(): Promise<number> {
  const dir = getBackupDir();
  const entries = await fs.readdir(dir).catch(() => [] as string[]);
  let latest = 0;
  for (const name of entries) {
    const ts = parseBackupTimestamp(name);
    if (ts && ts.getTime() > latest) latest = ts.getTime();
  }
  return latest;
}

/**
 * 定时器每次触发时的判断：仅在启用、已到当天计划时间、且距上次备份超过周期时才执行。
 * 返回是否真正执行了备份。
 */
export async function maybeRunScheduledBackup(
  db: PrismaClient
): Promise<boolean> {
  const schedule = await loadSchedule();
  if (!schedule.enabled) return false;

  const [h, m] = schedule.time.split(":").map(Number);
  const now = new Date();
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return false;

  const latest = await getLatestBackupTime();
  const elapsedDays = (now.getTime() - latest) / 86_400_000;
  if (latest > 0 && elapsedDays < schedule.everyDays) return false;

  await createBackup(db);
  return true;
}

// ===== 恢复 =====

export const backupPayloadSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.string(),
  articles: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        summary: z.string().nullish(),
        categoryId: z.string().nullish(),
        status: z.string().default("normal"),
        visibility: z.string().default("private"),
        isPinned: z.boolean().default(false),
        isFavorite: z.boolean().default(false),
        createdAt: z.string().nullish(),
        updatedAt: z.string().nullish(),
        deletedAt: z.string().nullish(),
        tagNames: z.array(z.string()).default([]),
      })
    )
    .default([]),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        parentId: z.string().nullish(),
        sort: z.number().int().default(0),
        createdAt: z.string().nullish(),
      })
    )
    .default([]),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        createdAt: z.string().nullish(),
      })
    )
    .default([]),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        mimeType: z.string(),
        size: z.number().int(),
        kind: z.string(),
        createdAt: z.string().nullish(),
      })
    )
    .default([]),
});
export type BackupPayload = z.infer<typeof backupPayloadSchema>;

/**
 * 全量恢复：清空并重建文章/分类/标签/附件数据（不含账号）。
 * 事务内执行，任一步失败整体回滚。
 */
export async function restoreBackup(
  db: PrismaClient,
  payload: BackupPayload
): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.articleTag.deleteMany();
    await tx.article.deleteMany();
    await tx.category.deleteMany();
    await tx.tag.deleteMany();
    await tx.attachment.deleteMany();

    // 分类：先建全部，再回填 parentId（保证父分类已存在）
    for (const c of payload.categories) {
      await tx.category.create({
        data: {
          id: c.id,
          name: c.name,
          sort: c.sort ?? 0,
          createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
        },
      });
    }
    for (const c of payload.categories) {
      if (c.parentId) {
        await tx.category.update({
          where: { id: c.id },
          data: { parentId: c.parentId },
        });
      }
    }

    const tagIdByName = new Map<string, string>();
    for (const t of payload.tags) {
      tagIdByName.set(t.name, t.id);
      await tx.tag.create({
        data: {
          id: t.id,
          name: t.name,
          createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
        },
      });
    }

    for (const a of payload.articles) {
      await tx.article.create({
        data: {
          id: a.id,
          title: a.title,
          content: a.content,
          summary: a.summary ?? null,
          categoryId: a.categoryId ?? null,
          status: a.status ?? "normal",
          visibility: a.visibility ?? "private",
          isPinned: !!a.isPinned,
          isFavorite: !!a.isFavorite,
          createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
          updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
          deletedAt: a.deletedAt ? new Date(a.deletedAt) : null,
        },
      });
      for (const tagName of a.tagNames) {
        const tagId = tagIdByName.get(tagName);
        if (tagId) {
          await tx.articleTag.create({
            data: { articleId: a.id, tagId },
          });
        }
      }
    }

    for (const at of payload.attachments) {
      await tx.attachment.create({
        data: {
          id: at.id,
          name: at.name,
          url: at.url,
          mimeType: at.mimeType,
          size: at.size,
          kind: at.kind,
          createdAt: at.createdAt ? new Date(at.createdAt) : undefined,
        },
      });
    }
  });
}
