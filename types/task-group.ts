// ─── Entity ───────────────────────────────────────────────────────────────

export interface TaskGroup {
  id: string;
  name: string;
  description: string | null;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  maxWorkloadDays: number;
  maxActiveTasks: number | null;
  requireAllMembers: boolean;
  members?: {
    internId: string;
    intern: {
      id: string;
      leaderId: string | null;
      fullName: string;
      status: "ACTIVE" | "COMPLETED" | "DROPPED";
      user: { email: string };
      department: { id: string; name: string } | null;
      position: { id: string; name: string } | null;
    };
  }[];
  _count?: { tasks: number; members: number };
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
  memberIds?: string[];
  maxWorkloadDays?: number;
  maxActiveTasks?: number | null;
  requireAllMembers?: boolean;
}

export interface UpdateTaskGroupPayload {
  name?: string;
  description?: string | null;
  departmentId?: string | null;
  memberIds?: string[];
  maxWorkloadDays?: number;
  maxActiveTasks?: number | null;
  requireAllMembers?: boolean;
}
