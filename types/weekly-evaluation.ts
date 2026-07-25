import type { Intern } from "./intern";

// ─── Rating Level ─────────────────────────────────────────────────────────────
// 5 mức xếp loại: TOT=10, KHA=8, TB=6, TBY=4, YEU=2
export type RatingLevel = "TOT" | "KHA" | "TB" | "TBY" | "YEU";

export const RATING_LABELS: Record<RatingLevel, string> = {
  TOT: "Tốt",
  KHA: "Khá",
  TB: "Trung bình",
  TBY: "Trung bình yếu",
  YEU: "Yếu",
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
 * 12 tiêu chí đánh giá theo mẫu mới.
 */
export interface EvaluationRatings {
  // Phần I: Kỷ luật và tư chất
  ruleCompliance: RatingLevel;   // 1. Thực hiện nội quy của cơ quan
  workAttitude: RatingLevel;     // 2. Thái độ làm việc
  learningCapacity: RatingLevel; // 3. Năng lực tiếp thu
  resilience: RatingLevel;       // 4. Khả năng vượt khó, chịu áp lực
  communication: RatingLevel;    // 5. Giao tiếp và ứng xử

  // Phần II: Khả năng chuyên môn
  knowledge: RatingLevel;        // 1. Kiến thức
  practicalSkills: RatingLevel;  // 2. Kỹ năng thực hành
  foreignLanguage: RatingLevel;  // 3. Năng lực ngoại ngữ
  teamwork: RatingLevel;         // 4. Kỹ năng làm việc nhóm
  creativity: RatingLevel;       // 5. Tính sáng tạo

  // Phần III: Kết quả thực hiện đề tài
  contentQuality: RatingLevel;   // 1. Thực hiện yêu cầu về nội dung
  progressDelivery: RatingLevel; // 2. Thực hiện yêu cầu về tiến độ
}

export const CRITERIA_SECTIONS = [
  {
    id: "I",
    label: "Kỷ luật và tư chất",
    criteria: [
      { key: "ruleCompliance" as keyof EvaluationRatings, label: "Thực hiện nội quy của cơ quan" },
      { key: "workAttitude" as keyof EvaluationRatings, label: "Thái độ làm việc" },
      { key: "learningCapacity" as keyof EvaluationRatings, label: "Năng lực tiếp thu" },
      { key: "resilience" as keyof EvaluationRatings, label: "Khả năng vượt khó, chịu áp lực" },
      { key: "communication" as keyof EvaluationRatings, label: "Giao tiếp và ứng xử" },
    ],
  },
  {
    id: "II",
    label: "Khả năng chuyên môn",
    criteria: [
      { key: "knowledge" as keyof EvaluationRatings, label: "Kiến thức" },
      { key: "practicalSkills" as keyof EvaluationRatings, label: "Kỹ năng thực hành" },
      { key: "foreignLanguage" as keyof EvaluationRatings, label: "Năng lực ngoại ngữ" },
      { key: "teamwork" as keyof EvaluationRatings, label: "Kỹ năng làm việc nhóm" },
      { key: "creativity" as keyof EvaluationRatings, label: "Tính sáng tạo" },
    ],
  },
  {
    id: "III",
    label: "Kết quả thực hiện đề tài",
    criteria: [
      { key: "contentQuality" as keyof EvaluationRatings, label: "Thực hiện yêu cầu về nội dung" },
      { key: "progressDelivery" as keyof EvaluationRatings, label: "Thực hiện yêu cầu về tiến độ" },
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
  ratings: EvaluationRatings;
  // Tính toán tự động, gửi để tương thích ngược
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
