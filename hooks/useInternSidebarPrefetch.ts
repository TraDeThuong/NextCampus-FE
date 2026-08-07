// hooks/useInternSidebarPrefetch.ts
"use client";

import { useCallback } from "react";
import { useInternPrefetchQueries } from "@/hooks/useInternPrefetchQueries";

const PATH_TO_PAGE_KEY: Record<string, string> = {
  "/intern/task": "task",
  "/intern/daily-report": "daily-report",
  "/intern/meetings": "meetings",
  "/intern/weekly-evaluation": "weekly-evaluation",
  "/intern/profile": "profile",
};

export function useInternSidebarPrefetch() {
  const { prefetchPage } = useInternPrefetchQueries();

  const getPrefetchHandler = useCallback(
    (href: string) => {
      const pageKey = PATH_TO_PAGE_KEY[href];
      if (!pageKey) return undefined;
      return () => prefetchPage(pageKey);
    },
    [prefetchPage],
  );

  return { getPrefetchHandler };
}