// ─── Entity ──────────────────────────────────────────────────────────────────

export interface DailyReport {
  id: string;
  internId: string;
  content: string;
  prLink: string | null;
  videoDemo: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Response wrappers ──────────────────────────────────────────────────────

export interface DailyReportSuccessResponse {
  success: boolean;
  data: DailyReport;
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
  createdAtFrom?: string;
  createdAtTo?: string;
  sortBy?: "createdAt" | "internId";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Payloads ───────────────────────────────────────────────────────────────

export interface CreateDailyReportPayload {
  content: string;
  prLink?: string;
  videoDemo?: string;
}

export interface UpdateDailyReportPayload {
  content?: string;
  prLink?: string | null;
  videoDemo?: string | null;
}
