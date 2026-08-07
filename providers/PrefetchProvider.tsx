"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";
import { internService } from "@/services/intern.service";
import { departmentService } from "@/services/department.service";
import { useAdminPrefetchQueries } from "@/hooks/useAdminPrefetchQueries";
import { useLeaderPrefetchQueries } from "@/hooks/useLeaderPrefetchQueries";
import { useInternPrefetchQueries } from "@/hooks/useInternPrefetchQueries";

interface PrefetchProviderProps {
  role: "ADMIN" | "LEADER" | "INTERN";
}

function LeaderBackgroundPrefetch() {
  const { prefetchAllStaggered } = useLeaderPrefetchQueries();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const cleanup = prefetchAllStaggered();
    return cleanup;
  }, [prefetchAllStaggered]);

  return null;
}

function LeaderPrefetch() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Immediate prefetch: dashboard stats
    queryClient.prefetchQuery({
      queryKey: ["stats", "leader"],
      queryFn: () => statsService.getLeaderStats(),
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  return <LeaderBackgroundPrefetch />;
}

function AdminBackgroundPrefetch() {
  const { prefetchAllStaggered } = useAdminPrefetchQueries();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const cleanup = prefetchAllStaggered();
    return cleanup;
  }, [prefetchAllStaggered]);

  return null;
}

function AdminPrefetch() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    queryClient.prefetchQuery({
      queryKey: ["stats", "admin"],
      queryFn: () => statsService.getAdminStats(),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["interns", {}],
      queryFn: () => internService.getInterns({}),
      staleTime: 1000 * 60 * 2,
    });
    queryClient.prefetchQuery({
      queryKey: ["departments"],
      queryFn: () => departmentService.getDepartments(),
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

  return <AdminBackgroundPrefetch />;
}

function InternBackgroundPrefetch() {
  const { prefetchAllStaggered } = useInternPrefetchQueries();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const cleanup = prefetchAllStaggered();
    return cleanup;
  }, [prefetchAllStaggered]);

  return null;
}

function InternPrefetch() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Immediate prefetch: dashboard stats
    queryClient.prefetchQuery({
      queryKey: ["stats", "intern"],
      queryFn: () => statsService.getInternStats(),
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  return <InternBackgroundPrefetch />;
}

export default function PrefetchProvider({ role }: PrefetchProviderProps) {
  switch (role) {
    case "LEADER":
      return <LeaderPrefetch />;
    case "ADMIN":
      return <AdminPrefetch />;
    case "INTERN":
      return <InternPrefetch />;
    default:
      return null;
  }
}
