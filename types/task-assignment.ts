// ─── Status types ──────────────────────────────────────────────────────────

export type AssignmentStatus =
  | "PENDING_APPROVAL"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "BLOCKED"
  | "EXTENSION_PENDING";

export type ExtensionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  dependsOn?: Array<{ id: string; code: string | null; title: string; assignment?: { id: string; status: string } | null }>;
  dependencies?: Array<{ id: string; code: string | null; title: string; assignment?: { id: string; status: string } | null }>;
}

export interface AssignmentAssigner {
  id: string;
  email: string;
  fullName: string;
}

export interface AssignmentSupport {
  id: string;
  fullName: string;
  user: { id: string; email: string; fullName: string; avatarUrl?: string | null };
}

export interface TaskExtensionRequest {
  id: string;
  assignmentId: string;
  internId: string;
  currentDeadline: string;
  proposedDeadline: string;
  extensionDays: number;
  reason: string;
  commitmentPlan: string;
  status: ExtensionRequestStatus;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  intern?: {
    id: string;
    fullName: string;
    internCode?: string | null;
    department?: { id: string; name: string } | null;
    user?: { id: string; email: string | null } | null;
  };
  reviewer?: {
    id: string;
    fullName?: string | null;
    email?: string | null;
  } | null;
  assignment?: {
    id: string;
    taskId: string;
    status: AssignmentStatus;
    task?: {
      id: string;
      code: string | null;
      title: string;
      deadline: string;
    };
  };
  totalExtensionsOnTask?: number;
  totalExtensionsInInternship?: number;
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
  extensionRequests?: TaskExtensionRequest[];
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

export interface TaskExtensionRequestResponse {
  success: boolean;
  data: TaskExtensionRequest;
  message?: string;
}

export interface TaskExtensionRequestListResponse {
  success: boolean;
  items: TaskExtensionRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskAssignmentExtensionRequestsResponse {
  success: boolean;
  items: TaskExtensionRequest[];
  totalExtensionsOnTask: number;
  totalExtensionsInInternship: number;
}

// ─── Query params ─────────────────────────────────────────────────────────

export interface TaskAssignmentQueryParams {
  taskId?: string;
  internId?: string;
  assignedBy?: string;
  leaderId?: string;
  status?: AssignmentStatus;
  role?: "ALL" | "OWNER" | "SUPPORT";
  sortBy?: "assignedAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface TaskExtensionRequestQueryParams {
  assignmentId?: string;
  internId?: string;
  status?: ExtensionRequestStatus;
  page?: number;
  limit?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateTaskAssignmentPayload {
  taskId: string;
  internId: string;
  internEmail?: string;
  supportId?: string | null;
}

export type AssignTaskPayload = Omit<CreateTaskAssignmentPayload, "taskId">;

export interface UpdateTaskAssignmentPayload {
  status?: AssignmentStatus;
  blockedReason?: string;
  internId?: string;
  internEmail?: string;
  supportId?: string | null;
}

export interface RequestExtensionPayload {
  proposedDeadline: string;
  extensionDays: number;
  reason: string;
  commitmentPlan: string;
}

export interface RejectExtensionPayload {
  rejectionReason: string;
}
