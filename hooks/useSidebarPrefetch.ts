"use client";

import { useCallback } from "react";
import { useAdminPrefetchQueries } from "@/hooks/useAdminPrefetchQueries";

const PATH_TO_PAGE_KEY: Record<string, string> = {
  "/admin/leaders": "leaders",
  "/admin/admin-team": "admin-team",
  "/admin/onboarding": "onboarding",
  "/admin/emails": "emails",
  "/admin/mettings": "meetings",
  "/admin/policies": "policies",
  "/admin/activity-logs": "activity-logs",
  "/admin/profile": "profile",
};

export function useSidebarPrefetch() {
  const { prefetchPage } = useAdminPrefetchQueries();

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