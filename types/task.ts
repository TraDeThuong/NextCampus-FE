// ─── Status types ──────────────────────────────────────────────────────────

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// ─── Sub-entities ─────────────────────────────────────────────────────────

export interface TaskGroup {
  id: string;
  name: string;
}

export interface TaskCreator {
  id: string;
  email: string;
  fullName: string;
}

export interface TaskAssignmentSummary {
  id: string;
  taskId: string;
  internId: string;
  assignedBy: string;
  status: string;
  assignedAt: string;
  updatedAt: string;
  intern?: { id: string; fullName: string };
}

export interface TaskAttachmentSummary {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export interface TaskDependency {
  id: string;
  code: string;
  title: string;
}

// ─── Entity ───────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  code: string | null;
  title: string;
  description: string | null;
  deadline: string;
  startDate: string | null;
  estDays: number | null;
  phase: string | null;
  module: string | null;
  acceptanceCriteria: string | null;
  taskNotes: string | null;
  priority: TaskPriority;
  taskGroupId: string | null;
  createdBy: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  taskGroup: TaskGroup | null;
  creator: TaskCreator;
  assignment: TaskAssignmentSummary | null;
  attachments: TaskAttachmentSummary[];
  dependsOn: TaskDependency[];
  dependencies: TaskDependency[];
}

// ─── Response wrappers ────────────────────────────────────────────────────

export interface TaskSuccessResponse {
  success: boolean;
  data: Task;
}

export interface TaskListResponse {
  success: boolean;
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskDeleteResponse {
  success: boolean;
  message: string;
}

// ─── Query params ─────────────────────────────────────────────────────────

export interface TaskQueryParams {
  title?: string;
  priority?: TaskPriority;
  createdBy?: string;
  phase?: string;
  module?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  taskGroupId?: string;
  status?: string;
  statusNot?: string;
  sortBy?: "createdAt" | "title" | "deadline" | "priority";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description?: string;
  deadline: string;
  priority?: TaskPriority;
  code?: string;
  startDate?: string;
  estDays?: number;
  phase?: string;
  module?: string;
  acceptanceCriteria?: string;
  taskNotes?: string;
  taskGroupId?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  deadline?: string;
  priority?: TaskPriority;
  code?: string | null;
  startDate?: string | null;
  estDays?: number | null;
  phase?: string | null;
  module?: string | null;
  acceptanceCriteria?: string | null;
  taskNotes?: string | null;
  taskGroupId?: string | null;
}

// ─── Bulk Import ──────────────────────────────────────────────────────────

export interface ImportTaskRow {
  excelCode: string;
  title: string;
  description: string;
  deadline: string;
  startDate?: string;
  priority: TaskPriority;
  ownerName?: string;
  supportName?: string;
  phase?: string;
  module?: string;
  estDays?: number;
  acceptanceCriteria?: string;
  taskNotes?: string;
  dependencyCodes: string[];
}

export interface ImportPreviewData {
  totalRows: number;
  validRows: ImportTaskRow[];
  errorRows: { rowIndex: number; excelCode?: string; errors: string[] }[];
  internMappings: {
    ownerName: string;
    internId: string | null;
    internFullName: string | null;
  }[];
  taskGroupId?: string;
  taskGroupName?: string;
}

export interface ImportResultData {
  importedTasks: number;
  importedAssignments: number;
  importedDependencies: number;
  importedAttachments: number;
  skippedCodes: string[];
  errorRows: { excelCode?: string; error: string }[];
  taskGroupId?: string;
  taskGroupName?: string;
}

export interface ImportPreviewResponse {
  success: boolean;
  data: ImportPreviewData;
}

export interface ImportResultResponse {
  success: boolean;
  data: ImportResultData;
}

// ─── Analytics ────────────────────────────────────────────────────────────

export interface TaskStatusDistribution {
  status: string;
  count: number;
}

export interface TaskPriorityDistribution {
  priority: string;
  count: number;
}

export interface WorkloadByIntern {
  internId: string;
  internFullName: string;
  totalTasks: number;
  totalEstDays: number;
  byStatus: TaskStatusDistribution[];
}

export interface PhaseProgress {
  phase: string;
  totalTasks: number;
  doneTasks: number;
  completionRate: number;
}

export interface TaskAnalytics {
  overview: {
    totalTasks: number;
    overdueTasks: number;
    byStatus: TaskStatusDistribution[];
    byPriority: TaskPriorityDistribution[];
  };
  workloadByIntern: WorkloadByIntern[];
  progressByPhase: PhaseProgress[];
}

export interface TaskAnalyticsResponse {
  success: boolean;
  data: TaskAnalytics;
}
