// ─── Status types ──────────────────────────────────────────────────────────

export type AssignmentStatus =
  | "PENDING_APPROVAL"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "BLOCKED";

// ─── Sub-entities ─────────────────────────────────────────────────────────

export interface AssignmentIntern {
  id: string;
  userId: string;
  leaderId: string | null;
  fullName: string;
  phone: string;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
  startDate: string;
  duration: number;
  discordUsername: string | null;
  discordRoleGranted: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; fullName: string };
}

export interface AssignmentTask {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAssigner {
  id: string;
  email: string;
  fullName: string;
}

export interface AssignmentSupport {
  id: string;
  fullName: string;
  user: { id: string; email: string; fullName: string };
}

// ─── Entity ───────────────────────────────────────────────────────────────

export interface TaskAssignment {
  id: string;
  taskId: string;
  internId: string;
  supportId: string | null;
  assignedBy: string;
  status: AssignmentStatus;
  assignedAt: string;
  updatedAt: string;
  task: AssignmentTask;
  intern: AssignmentIntern;
  support: AssignmentSupport | null;
  assigner: AssignmentAssigner;
}

// ─── Response wrappers ────────────────────────────────────────────────────

export interface TaskAssignmentSuccessResponse {
  success: boolean;
  data: TaskAssignment;
}

export interface TaskAssignmentListResponse {
  success: boolean;
  data: TaskAssignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskAssignmentDeleteResponse {
  success: boolean;
  message: string;
}

// ─── Query params ─────────────────────────────────────────────────────────

export interface TaskAssignmentQueryParams {
  taskId?: string;
  internId?: string;
  assignedBy?: string;
  status?: AssignmentStatus;
  sortBy?: "assignedAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateTaskAssignmentPayload {
  taskId: string;
  internId: string;
}

export interface UpdateTaskAssignmentPayload {
  status?: AssignmentStatus;
  internId?: string;
}
