import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import MarkdownIt from "markdown-it";

const OBS_DIR = process.argv[2] || "/Users/macos/Desktop/obs";
const md = new MarkdownIt();

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const db = new PrismaClient({ adapter });

  // 确保默认分类存在
  const defaultCat = await db.category.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", name: "未分类", sort: 999 },
  });

  const files = findMdFiles(OBS_DIR);
  console.log(`找到 ${files.length} 个 md 文件`);

  let imported = 0;
  for (const file of files) {
    const relPath = path.relative(OBS_DIR, file);
    const title = path.basename(file, ".md");
    const content = fs.readFileSync(file, "utf-8");
    const html = md.render(content);

    // 从路径生成分类
    const dir = path.dirname(relPath);
    const catName = dir === "." ? "根目录" : dir.split(path.sep)[0];

    let category = await db.category.findFirst({ where: { name: catName } });
    if (!category) {
      category = await db.category.create({ data: { name: catName } });
    }

    // 检查是否已存在
    const existing = await db.article.findFirst({ where: { title } });
    if (existing) {
      console.log(`跳过(已存在): ${title}`);
      continue;
    }

    await db.article.create({
      data: {
        title,
        content: html,
        summary: content.slice(0, 200).replace(/[#*`\n]/g, " ").trim() + "...",
        categoryId: category.id,
        status: "normal",
        visibility: "public",
      },
    });
    imported++;
    console.log(`导入: ${title} -> ${catName}`);
  }

  console.log(`完成! 共导入 ${imported} 篇文章`);
  await db.$disconnect();
}

function findMdFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      results.push(...findMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

main().catch(console.error);
