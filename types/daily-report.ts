// ─── Attachments ─────────────────────────────────────────────────────────────

export interface ReportAttachment {
  id: string;
  reportId: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export interface CreateReportAttachmentPayload {
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

// ─── Entity ──────────────────────────────────────────────────────────────────

export interface DailyReport {
  id: string;
  internId: string;
  date: string;
  content: string;
  blockers: string | null;
  nextPlan: string | null;
  hoursWorked: number | null;
  prLink: string | null;
  videoDemo: string | null;
  feedback: string | null;
  feedbackBy: string | null;
  feedbackAt: string | null;
  createdAt: string;
  updatedAt: string;
  intern?: {
    id: string;
    fullName: string;
    phone?: string;
    internCode?: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
    position?: {
      id: string;
      name: string;
    } | null;
    user?: {
      id: string;
      email: string;
      fullName: string | null;
      avatarUrl?: string | null;
    };
  };
  feedbackUser?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  attachments?: ReportAttachment[];
}

// ─── Response wrappers ──────────────────────────────────────────────────────

export interface DailyReportSuccessResponse {
  success: boolean;
  data: DailyReport;
  message?: string;
  code?: string;
}

export interface DailyReportListResponse {
  success: boolean;
  data: DailyReport[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Query params ───────────────────────────────────────────────────────────

export interface DailyReportQueryParams {
  internId?: string;
  departmentId?: string;
  date?: string;            // YYYY-MM-DD theo múi giờ Asia/Ho_Chi_Minh
  from?: string;            // Ngày bắt đầu khoảng lọc YYYY-MM-DD
  to?: string;              // Ngày kết thúc khoảng lọc YYYY-MM-DD
  createdAtFrom?: string;   // Backward compatibility alias
  createdAtTo?: string;     // Backward compatibility alias
  sortBy?: "date" | "createdAt" | "updatedAt" | "hoursWorked" | "internId";
  sortOrder?: "asc" | "desc";
  order?: "asc" | "desc";   // Backward compatibility alias
  page?: number;
  limit?: number;
}

// ─── Payloads ───────────────────────────────────────────────────────────────

export interface CreateDailyReportPayload {
  internId?: string;
  date?: string;            // YYYY-MM-DD
  content: string;
  blockers?: string | null;
  nextPlan?: string | null;
  hoursWorked?: number | null;
  prLink?: string | null;
  videoDemo?: string | null;
  attachments?: CreateReportAttachmentPayload[];
}

export interface UpdateDailyReportPayload {
  content?: string;
  blockers?: string | null;
  nextPlan?: string | null;
  hoursWorked?: number | null;
  prLink?: string | null;
  videoDemo?: string | null;
  attachments?: CreateReportAttachmentPayload[];
}

export interface DailyReportFeedbackPayload {
  feedback: string;
}

// ─── Calendar View Types ────────────────────────────────────────────────────

export type CalendarDayStatus =
  | "REPORTED"
  | "MISSING"
  | "FUTURE"
  | "WEEKEND"
  | "OUT_OF_RANGE";

export interface CalendarDayDto {
  date: string;             // YYYY-MM-DD
  dayOfWeek: number;        // 0 = Sunday, 1 = Monday, ...
  status: CalendarDayStatus;
  reportId?: string;
  hoursWorked?: number;
  hasFeedback?: boolean;
}

export interface DailyReportCalendarQueryDto {
  month: number;            // 1-12
  year: number;
  internId?: string;
}

export interface DailyReportCalendarResponseDto {
  internId: string;
  month: number;
  year: number;
  totalWorkingDays: number;
  reportedDays: number;
  missingDays: number;
  submissionRate: number;   // Percentage 0 - 100
  days: CalendarDayDto[];
}
