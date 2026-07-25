import api from "@/lib/axios";

export const pdfExportService = {
  exportWeeklyEvaluation: async (id: string): Promise<{ success: boolean; data: { fileUrl: string } }> => {
    const response = await api.post(`/pdf-exports/weekly-evaluations/${id}`);
    return response.data;
  },
};
