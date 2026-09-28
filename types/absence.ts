export type AbsenceDuration = "MORNING" | "AFTERNOON" | "FULL_DAY" | "MULTI_DAY";

export type AbsenceReasonType =
  | "EXAM"
  | "SICKNESS"
  | "UNIVERSITY_EVENT"
  | "PERSONAL"
  | "OTHER";

export type AbsenceStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface TaskConflict {
  taskId: string;
  code: string | null;
  title: string;
  deadline: string;
  status: string;
  priority: string;
}

export interface Absence {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  durationUnit: AbsenceDuration;
  reasonType: AbsenceReasonType;
  reason: string;
  evidenceUrl: string | null;
  status: AbsenceStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  conflictTasks?: TaskConflict[];
  user?: {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    intern?: {
      id: string;
      internCode: string | null;
      leaderId: string | null;
      department?: {
        id: string;
        name: string;
      } | null;
    } | null;
  };
  reviewer?: {
    id: string;
    email: string | null;
    fullName: string | null;
  } | null;
}

export interface CreateAbsenceInput {
  startDate: string;
  endDate: string;
  durationUnit?: AbsenceDuration;
  reasonType?: AbsenceReasonType;
  reason: string;
  evidenceUrl?: string | null;
}

export interface ReviewAbsenceInput {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
  autoExtendConflictTasks?: boolean;
  extendDays?: number;
}

export interface AbsenceQueryParams {
  status?: AbsenceStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "startDate" | "createdAt";
  order?: "asc" | "desc";
}

export interface AbsencePaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AbsenceListResponse {
  success: boolean;
  data: Absence[];
  meta: AbsencePaginationMeta;
}

export interface PresignedUploadUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    fileUrl: string;
    filePath: string;
    key: string;
  };
}
