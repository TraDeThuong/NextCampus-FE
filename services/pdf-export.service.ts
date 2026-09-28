import api from "@/lib/axios";
import type {
  PdfExportResponse,
  InternshipSummaryDataResponse,
} from "@/types/pdf-export";

export const pdfExportService = {
  exportWeeklyEvaluation: async (id: string): Promise<PdfExportResponse> => {
    const response = await api.post<PdfExportResponse>(`/pdf-export/weekly-evaluation/${id}`);
    return response.data;
  },

  exportInternshipSummary: async (internId: string): Promise<PdfExportResponse> => {
    const response = await api.post<PdfExportResponse>(`/pdf-export/internship-summary/${internId}`);
    return response.data;
  },

  getInternshipSummaryData: async (internId: string): Promise<InternshipSummaryDataResponse> => {
    const response = await api.get<InternshipSummaryDataResponse>(
      `/pdf-export/internship-summary/${internId}/data`
    );
    return response.data;
  },
};
