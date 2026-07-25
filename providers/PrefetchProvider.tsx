"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";
import { internService } from "@/services/intern.service";
import { taskService } from "@/services/task.service";
import { departmentService } from "@/services/department.service";

interface PrefetchProviderProps {
  role: "ADMIN" | "LEADER" | "INTERN";
}

function LeaderPrefetch() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    queryClient.prefetchQuery({
      queryKey: ["stats", "leader"],
      queryFn: () => statsService.getLeaderStats(),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["interns", {}],
      queryFn: () => internService.getInterns({}),
      staleTime: 1000 * 60 * 2,
    });
    queryClient.prefetchQuery({
      queryKey: ["tasks", { limit: 20 }],
      queryFn: () => taskService.getTasks({ limit: 20 }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["departments"],
      queryFn: () => departmentService.getDepartments(),
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

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

  return null;
}

function InternPrefetch() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    queryClient.prefetchQuery({
      queryKey: ["stats", "intern"],
      queryFn: () => statsService.getInternStats(),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["tasks", {}],
      queryFn: () => taskService.getTasks({}),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["departments"],
      queryFn: () => departmentService.getDepartments(),
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

  return null;
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
