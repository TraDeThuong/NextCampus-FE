import type { Intern } from "./intern";

// ─── Rating Level ─────────────────────────────────────────────────────────────
// 5 rating levels: TOT=10, KHA=8, TB=6, TBY=4, YEU=2
export type RatingLevel = "TOT" | "KHA" | "TB" | "TBY" | "YEU";

export const RATING_LABELS: Record<RatingLevel, string> = {
  TOT: "Excellent",
  KHA: "Good",
  TB: "Average",
  TBY: "Below Average",
  YEU: "Poor",
};

export const RATING_SCORES: Record<RatingLevel, number> = {
  TOT: 10,
  KHA: 8,
  TB: 6,
  TBY: 4,
  YEU: 2,
};

export const RATING_COLORS: Record<RatingLevel, string> = {
  TOT: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  KHA: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  TB: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  TBY: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  YEU: "text-red-400 border-red-500/30 bg-red-500/10",
};

/**
 * 12 evaluation criteria (new template).
 */
export interface EvaluationRatings {
  // Section I: Discipline & Aptitude
  ruleCompliance: RatingLevel;   // 1. Compliance with organizational rules
  workAttitude: RatingLevel;     // 2. Work attitude
  learningCapacity: RatingLevel; // 3. Learning capacity
  resilience: RatingLevel;       // 4. Resilience & stress tolerance
  communication: RatingLevel;    // 5. Communication & interpersonal skills

  // Section II: Professional competence
  knowledge: RatingLevel;        // 1. Knowledge
  practicalSkills: RatingLevel;  // 2. Practical skills
  foreignLanguage: RatingLevel;  // 3. Foreign language proficiency
  teamwork: RatingLevel;         // 4. Teamwork skills
  creativity: RatingLevel;       // 5. Creativity

  // Section III: Project delivery results
  contentQuality: RatingLevel;   // 1. Content quality delivery
  progressDelivery: RatingLevel; // 2. Progress & timeline adherence
}

export const CRITERIA_SECTIONS = [
  {
    id: "I",
    label: "Discipline & Aptitude",
    criteria: [
      { key: "ruleCompliance" as keyof EvaluationRatings, label: "Compliance with organizational rules" },
      { key: "workAttitude" as keyof EvaluationRatings, label: "Work attitude" },
      { key: "learningCapacity" as keyof EvaluationRatings, label: "Learning capacity" },
      { key: "resilience" as keyof EvaluationRatings, label: "Resilience & stress tolerance" },
      { key: "communication" as keyof EvaluationRatings, label: "Communication & interpersonal skills" },
    ],
  },
  {
    id: "II",
    label: "Professional Competence",
    criteria: [
      { key: "knowledge" as keyof EvaluationRatings, label: "Knowledge" },
      { key: "practicalSkills" as keyof EvaluationRatings, label: "Practical skills" },
      { key: "foreignLanguage" as keyof EvaluationRatings, label: "Foreign language proficiency" },
      { key: "teamwork" as keyof EvaluationRatings, label: "Teamwork skills" },
      { key: "creativity" as keyof EvaluationRatings, label: "Creativity" },
    ],
  },
  {
    id: "III",
    label: "Project Delivery Results",
    criteria: [
      { key: "contentQuality" as keyof EvaluationRatings, label: "Content quality delivery" },
      { key: "progressDelivery" as keyof EvaluationRatings, label: "Progress & timeline adherence" },
    ],
  },
] as const;

export const DEFAULT_RATINGS: EvaluationRatings = {
  ruleCompliance: "TB",
  workAttitude: "TB",
  learningCapacity: "TB",
  resilience: "TB",
  communication: "TB",
  knowledge: "TB",
  practicalSkills: "TB",
  foreignLanguage: "TB",
  teamwork: "TB",
  creativity: "TB",
  contentQuality: "TB",
  progressDelivery: "TB",
};

// ─── WeeklyEvaluation ─────────────────────────────────────────────────────────

type WeeklyEvaluationIntern = Omit<Intern, "user" | "leader"> & {
  user: Pick<Intern["user"], "id" | "email" | "fullName">;
};

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
  ratings: EvaluationRatings | null;
  aiRatings: EvaluationRatings | null;
  aiCommunication: number | null;
  aiAttitude: number | null;
  aiLearning: number | null;
  aiCoding: number | null;
  aiComment: string | null;
  aiGeneratedAt: string | null;
  leaderEdited: boolean;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  intern: WeeklyEvaluationIntern;
  leader: {
    id: string;
    email: string;
    fullName: string | null;
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
export interface CreateWeeklyEvaluationPayload {
  internId: string;
  week: number;
  ratings: EvaluationRatings;
  // Auto-calculated; sent for backward compatibility
  communication: number;
  attitude: number;
  learning: number;
  coding: number;
  comment?: string;
  aiRatings?: EvaluationRatings;
  aiCommunication?: number;
  aiAttitude?: number;
  aiLearning?: number;
  aiCoding?: number;
  aiComment?: string;
}

export interface UpdateWeeklyEvaluationPayload {
  ratings?: EvaluationRatings;
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
  ratings: EvaluationRatings;
  communication: number;
  attitude: number;
  learning: number;
  coding: number;
  totalScore: number;
  comment: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
