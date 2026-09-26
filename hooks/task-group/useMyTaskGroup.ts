"use client";

import { useQuery } from "@tanstack/react-query";
import { taskGroupService } from "@/services/task-group.service";
import type { TaskGroup } from "@/types/task-group";

function extractGroups(data: unknown): TaskGroup[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if ("data" in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) return inner;
    if (inner && typeof inner === "object" && "data" in inner && Array.isArray((inner as { data: unknown }).data)) {
      return (inner as { data: TaskGroup[] }).data;
    }
  }
  return [];
}

export function useMyTaskGroup() {
  const query = useQuery({
    queryKey: ["task-groups", "my-squad"],
    queryFn: () => taskGroupService.getAll({ limit: 10 }),
    staleTime: 1000 * 60 * 5,
  });

  const groups = extractGroups(query.data);
  const activeGroup = groups.find((g) => g.status === "ACTIVE") ?? groups[0] ?? null;

  return {
    ...query,
    groups,
    activeGroup,
    groupId: activeGroup?.id ?? null,
  };
}
