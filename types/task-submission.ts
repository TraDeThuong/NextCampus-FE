// ─── Status types ──────────────────────────────────────────────────────────

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

// ─── Sub-entities ─────────────────────────────────────────────────────────

export interface SubmissionReviewer {
  id: string;
  email: string;
  fullName: string;
}

export interface SubmissionAttachmentSummary {
  id: string;
  submissionId: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export interface SubmissionAssignment {
  id: string;
  taskId: string;
  internId: string;
  assignedBy: string;
  status: string;
  assignedAt: string;
  updatedAt: string;
  task: {
    id: string;
    title: string;
    description: string | null;
    deadline: string;
    priority: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  intern: {
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
  };
}

// ─── Entity ───────────────────────────────────────────────────────────────

export interface TaskSubmission {
  id: string;
  assignmentId: string;
  attempt: number;
  prLink: string | null;
  videoDemo: string | null;
  note: string | null;
  reviewStatus: ReviewStatus;
  reviewComment: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  updatedAt: string;
  assignment: SubmissionAssignment;
  reviewer: SubmissionReviewer | null;
  attachments: SubmissionAttachmentSummary[];
}

// ─── Response wrappers ────────────────────────────────────────────────────

export interface TaskSubmissionSuccessResponse {
  success: boolean;
  data: TaskSubmission;
}

export interface TaskSubmissionListResponse {
  success: boolean;
  data: TaskSubmission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskSubmissionThreadItem {
  id: string;
  attempt: number;
  prLink: string | null;
  videoDemo: string | null;
  note: string | null;
  reviewStatus: ReviewStatus;
  reviewComment: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  updatedAt: string;
  reviewer: SubmissionReviewer | null;
  attachments: Array<Omit<SubmissionAttachmentSummary, "submissionId">>;
}

export interface TaskSubmissionThreadResponse {
  success: boolean;
  data: {
    assignment: {
      id: string;
      status: string;
      task: SubmissionAssignment["task"];
      intern: SubmissionAssignment["intern"] | null;
      assigner: {
        id: string;
        email: string;
        fullName: string | null;
      };
      support: {
        id: string;
        userId: string;
        fullName: string;
      } | null;
    };
    thread: TaskSubmissionThreadItem[];
  };
}

export interface TaskSubmissionDeleteResponse {
  success: boolean;
  message: string;
}

// ─── Query params ─────────────────────────────────────────────────────────

export interface TaskSubmissionQueryParams {
  assignmentId?: string;
  reviewStatus?: ReviewStatus;
  reviewedBy?: string;
  internId?: string;
  taskId?: string;
  sortBy?: "submittedAt" | "reviewStatus" | "attempt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateTaskSubmissionPayload {
  assignmentId: string;
  prLink?: string;
  videoDemo?: string;
  note?: string;
}

export interface UpdateTaskSubmissionPayload {
  prLink?: string | null;
  videoDemo?: string | null;
  note?: string | null;
  reviewStatus?: ReviewStatus;
  reviewComment?: string | null;
}
