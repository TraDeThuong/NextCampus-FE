import api from "@/lib/axios";
import axios from "axios";
import type {
  Absence,
  AbsenceListResponse,
  AbsenceQueryParams,
  CreateAbsenceInput,
  ReviewAbsenceInput,
  TaskConflict,
  PresignedUploadUrlResponse,
} from "@/types/absence";

export const absenceService = {
  // 1. Lấy danh sách đơn xin nghỉ phép
  getAbsences: async (
    params?: AbsenceQueryParams,
  ): Promise<AbsenceListResponse> => {
    const response = await api.get<Record<string, unknown>>("/absences", {
      params,
    });
    const resData = response.data || {};
    const rawItems = (
      Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData.items)
          ? resData.items
          : []
    ) as Absence[];

    const metaObj = (
      resData.meta && typeof resData.meta === "object" ? resData.meta : {}
    ) as Record<string, unknown>;

    const total = Number(resData.total ?? metaObj.total ?? rawItems.length);
    const page = Number(resData.page ?? metaObj.page ?? (params?.page || 1));
    const limit = Number(resData.limit ?? metaObj.limit ?? (params?.limit || 20));
    const totalPages = Number(
      resData.totalPages ??
        metaObj.totalPages ??
        Math.max(1, Math.ceil(total / Math.max(1, limit))),
    );

    return {
      success: resData.success !== false,
      data: rawItems,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  // 2. Chi tiết đơn xin nghỉ phép
  getAbsenceById: async (id: string): Promise<Absence> => {
    const response = await api.get<{ success: boolean; data: Absence }>(
      `/absences/${id}`,
    );
    return response.data.data;
  },

  // 3. Lấy danh sách task bị trùng deadline với đợt nghỉ
  getTaskConflicts: async (id: string): Promise<TaskConflict[]> => {
    const response = await api.get<{ success: boolean; data: TaskConflict[] }>(
      `/absences/${id}/conflicts`,
    );
    return response.data.data || [];
  },

  // 4. Tạo mới đơn xin nghỉ phép (Intern)
  createAbsence: async (data: CreateAbsenceInput): Promise<Absence> => {
    const response = await api.post<{ success: boolean; data: Absence }>(
      "/absences",
      data,
    );
    return response.data.data;
  },

  // 5. Phê duyệt hoặc từ chối đơn xin nghỉ (Leader / Admin)
  reviewAbsence: async (
    id: string,
    data: ReviewAbsenceInput,
  ): Promise<Absence> => {
    const response = await api.post<{ success: boolean; data: Absence }>(
      `/absences/${id}/review`,
      data,
    );
    return response.data.data;
  },

  // 6. Hủy đơn xin nghỉ khi còn PENDING (Intern)
  cancelAbsence: async (id: string): Promise<Absence> => {
    const response = await api.post<{ success: boolean; data: Absence }>(
      `/absences/${id}/cancel`,
    );
    return response.data.data;
  },

  // 7. Lấy Presigned URL để upload file minh chứng lên Cloudflare R2
  getUploadUrl: async (
    fileName: string,
    mimeType: string,
  ): Promise<PresignedUploadUrlResponse["data"]> => {
    const response = await api.post<PresignedUploadUrlResponse>(
      "/absences/upload-url",
      { fileName, mimeType },
    );
    return response.data.data;
  },

  // 8. Upload file minh chứng trực tiếp lên R2 bằng presigned PUT URL
  uploadEvidenceFile: async (file: File): Promise<string> => {
    // 8.1. Lấy presigned upload URL từ backend
    const { uploadUrl, fileUrl } = await absenceService.getUploadUrl(
      file.name,
      file.type || "application/octet-stream",
    );

    // 8.2. PUT file trực tiếp lên R2
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      timeout: 60000,
    });

    return fileUrl;
  },
};
