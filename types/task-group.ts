// ─── Entity ───────────────────────────────────────────────────────────────

export interface TaskGroup {
  id: string;
  name: string;
  description: string | null;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

// ─── Response wrappers ────────────────────────────────────────────────────

export interface TaskGroupSuccessResponse {
  success: boolean;
  data: TaskGroup;
}

export interface TaskGroupListResponse {
  success: boolean;
  data: TaskGroup[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateTaskGroupPayload {
  name: string;
  description?: string;
  departmentId?: string | null;
}

export interface UpdateTaskGroupPayload {
  name?: string;
  description?: string | null;
  departmentId?: string | null;
}
