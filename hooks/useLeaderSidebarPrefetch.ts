// hooks/useLeaderSidebarPrefetch.ts
"use client";

import { useCallback } from "react";
import { useLeaderPrefetchQueries } from "@/hooks/useLeaderPrefetchQueries";

const PATH_TO_PAGE_KEY: Record<string, string> = {
  "/leader/interns": "interns",
  "/leader/department": "department",
  "/leader/tasks": "tasks",
  "/leader/daily-reports": "daily-reports", // no dedicated prefetch — relies on staggered
  "/leader/meetings": "meetings",
  "/leader/weekly-evaluation": "weekly-evaluation",
  "/leader/profile": "profile",
};

export function useLeaderSidebarPrefetch() {
  const { prefetchPage } = useLeaderPrefetchQueries();

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