"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/client";

export default function ArticleViewTracker({ articleId }: { articleId: string }) {
  const tracked = useRef(false);
  const { mutate } = api.article.trackView.useMutation();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    mutate({ id: articleId });
  }, [articleId, mutate]);

  return null;
}
