// ─── Sub-types ─────────────────────────────────────────────────────────────

export interface CandidateSummary {
  id: string;
  name: string;
  position: string | null;
  compatibilityScore: number;
  workloadScore: number;
  performanceScore: number;
  skillScore: number;
  learningScore: number;
  activeTaskDays: number;
  codingScore: number | null;
}

export interface RecommendationOwner {
  id: string;
  name: string;
  position: string | null;
  compatibilityScore: number;
  workloadDays: number;
  codingScore: number | null;
}

export interface RecommendationSupport {
  id: string;
  name: string;
  position: string | null;
  compatibilityScore: number;
  workloadDays: number;
  codingScore: number | null;
}

// ─── Entity ───────────────────────────────────────────────────────────────

export interface AiRecommendation {
  owner: RecommendationOwner;
  support: RecommendationSupport | null;
  reasons: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  workloadAnalysis: string;
  learningOpportunity: string;
  allCandidates: CandidateSummary[];
  meta: {
    totalEvaluated: number;
    aiFailed: boolean;
    generatedAt: string;
  };
}

// ─── Response wrapper ─────────────────────────────────────────────────────

export interface AiRecommendationResponse {
  success: boolean;
  data: AiRecommendation;
}
