-- CreateTable
CREATE TABLE "ArticleLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleLink_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLink_sourceId_targetId_key" ON "ArticleLink"("sourceId", "targetId");

-- CreateIndex
CREATE INDEX "ArticleLink_sourceId_idx" ON "ArticleLink"("sourceId");

-- CreateIndex
CREATE INDEX "ArticleLink_targetId_idx" ON "ArticleLink"("targetId");
