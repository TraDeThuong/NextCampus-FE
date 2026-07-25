import type { Intern } from "./intern";

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
  intern?: Intern;
  leader?: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

export interface WeeklyEvaluationQueryParams {
  internId?: string;
  leaderId?: string;
  week?: number;
  sortBy?: "week" | "totalScore" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateWeeklyEvaluationPayload {
  internId: string;
  week: number;
  communication: number;
  attitude: number;
  learning: number;
  coding: number;
  comment?: string;
  aiCommunication?: number;
  aiAttitude?: number;
  aiLearning?: number;
  aiCoding?: number;
  aiComment?: string;
}

export interface UpdateWeeklyEvaluationPayload {
  communication?: number;
  attitude?: number;
  learning?: number;
  coding?: number;
  comment?: string | null;
}

export interface AiSuggestionPayload {
  internId: string;
  week: number;
}

export interface AiSuggestionData {
  communication: number;
  attitude: number;
  learning: number;
  coding: number;
  comment: string;
}
