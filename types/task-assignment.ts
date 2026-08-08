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
  code: string | null;
  title: string;
  description: string | null;
  deadline: string;
  estDays: number | null;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  recreatedTaskId: string | null;
  recreatedTask: { id: string; title: string; code: string | null; assignment: { intern: { fullName: string } } | null } | null;
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
  blockedReason: string | null;
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
  leaderId?: string;
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
  internEmail?: string;
}

export type AssignTaskPayload = Omit<CreateTaskAssignmentPayload, "taskId">;

export interface UpdateTaskAssignmentPayload {
  status?: AssignmentStatus;
  blockedReason?: string;
  internId?: string;
  internEmail?: string;
}
