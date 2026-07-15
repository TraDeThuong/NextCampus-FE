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
