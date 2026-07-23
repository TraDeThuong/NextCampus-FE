// ─── Entity ───────────────────────────────────────────────────────────────

export interface TaskGroup {
  id: string;
  name: string;
  description: string | null;
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
}

export interface UpdateTaskGroupPayload {
  name?: string;
  description?: string | null;
}
