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
  };
}

export interface ExportWeeklyEvaluationPdfPayload {
  evaluationId: string;
}

export interface ExportInternshipSummaryPdfPayload {
  internId: string;
}
