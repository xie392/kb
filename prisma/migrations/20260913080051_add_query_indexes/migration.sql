-- CreateIndex
CREATE INDEX "Article_status_visibility_updatedAt_idx" ON "Article"("status", "visibility", "updatedAt");

-- CreateIndex
CREATE INDEX "Article_status_updatedAt_idx" ON "Article"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_isPinned_idx" ON "Article"("isPinned");

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");

-- CreateIndex
CREATE INDEX "ArticleTag_tagId_idx" ON "ArticleTag"("tagId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
