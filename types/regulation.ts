export interface Regulation {
  id: string;
  title: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegulationSuccessResponse {
  success: boolean;
  data: Regulation;
}

export interface RegulationListResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  items: Regulation[];
}

export interface CreateRegulationPayload {
  title: string;
  content: string;
  isActive?: boolean;
}

export interface UpdateRegulationPayload {
  title?: string;
  content?: string;
  isActive?: boolean;
}

