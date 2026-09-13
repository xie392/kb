-- AlterTable（移除已废弃的每日笔记字段）
DROP INDEX "Article_dailyDate_key";
ALTER TABLE "Article" DROP COLUMN "dailyDate";
