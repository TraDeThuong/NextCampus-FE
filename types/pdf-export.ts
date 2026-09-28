/**
 * Response tải file PDF presigned từ Cloudflare R2
 */
export interface PdfExportResponse {
  success: boolean;
  message?: string;
  code?: string;
  data: {
    fileUrl: string;       // Đường link presigned URL từ Cloudflare R2
    fileName: string;      // Tên file chuẩn (VD: Danh_gia_tuan_W5_NguyenVanA.pdf)
    expiresAt: string;     // Thời điểm link hết hạn (ISO string)
    fileSize?: number;     // Dung lượng file tính bằng bytes
    summary?: InternshipSummaryData;
  };
}

export interface ExportWeeklyEvaluationPdfPayload {
  evaluationId: string;
}

export interface ExportInternshipSummaryPdfPayload {
  internId: string;
}

export interface WeeklyEvaluationSummaryItem {
  week: number;
  dateRange: string;
  score: number;
  grade: string;
  gradeCode: string;
  comment: string;
}

export interface InternshipSummaryData {
  internId: string;
  internName: string;
  internCode: string;
  university: string;
  major: string;
  departmentName: string;
  positionName: string;
  startDateFormatted: string;
  endDateFormatted: string;
  leaderName: string;
  finalStatusLabel: string;
  avgScore: number;
  finalGrade: string;
  finalGradeCode: string;
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number;
  reportsTotal: number;
  weeklyEvaluations: WeeklyEvaluationSummaryItem[];
  finalAssessmentLeader?: string;
  finalRecommendation?: string;
  qrCodeUrl?: string;
}

export interface InternshipSummaryDataResponse {
  success: boolean;
  data: InternshipSummaryData;
}
