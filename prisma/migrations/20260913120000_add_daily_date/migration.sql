-- AlterTable
ALTER TABLE "Article" ADD COLUMN "dailyDate" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Article_dailyDate_key" ON "Article"("dailyDate");
