// ─── Entity ──────────────────────────────────────────────────────────────────

export interface WeeklyEvaluation {
  id: string;
  internId: string;
  leaderId: string;
  week: number;
  communication: number;
  attitude: number;
  learning: number;
  coding: number;
  totalScore: number;
  comment: string | null;
  aiCommunication: number | null;
  aiAttitude: number | null;
  aiLearning: number | null;
  aiCoding: number | null;
  aiComment: string | null;
  aiGeneratedAt: string | null;
  leaderEdited: boolean;
  createdAt: string;
  updatedAt: string;
  intern: {
    id: string;
    userId: string;
    leaderId: string | null;
    fullName: string;
    phone: string;
    department: { id: string; name: string } | null;
    position: { id: string; name: string } | null;
    startDate: string;
    duration: number;
    discordUsername: string | null;
    discordRoleGranted: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: { id: string; email: string; fullName: string };
  };
  leader: {
    id: string;
    email: string;
    fullName: string;
  };
}

// ─── Response wrappers ──────────────────────────────────────────────────────

export interface WeeklyEvaluationSuccessResponse {
  success: boolean;
  data: WeeklyEvaluation;
}

export interface WeeklyEvaluationListResponse {
  success: boolean;
  data: WeeklyEvaluation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Query params ───────────────────────────────────────────────────────────

export interface WeeklyEvaluationQueryParams {
  internId?: string;
  leaderId?: string;
  week?: number;
  sortBy?: "week" | "totalScore" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
