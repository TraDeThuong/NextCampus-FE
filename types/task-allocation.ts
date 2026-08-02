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

// ─── Group AI Allocation Types ─────────────────────────────────────────────

export interface GroupTaskAiRecommendationItem {
  taskId: string;
  taskTitle: string;
  taskCode: string | null;
  priority: string;
  estDays: number | null;
  deadline: string;
  suggestedOwner: {
    id: string;
    name: string;
    position: string | null;
    compatibilityScore: number;
    workloadDays: number;
  } | null;
  suggestedSupport: {
    id: string;
    name: string;
    position: string | null;
    compatibilityScore: number;
    workloadDays: number;
  } | null;
  reason: string;
}

export interface GroupAiRecommendation {
  taskGroupId: string;
  taskGroupName: string;
  department: { id: string; name: string } | null;
  tasks: GroupTaskAiRecommendationItem[];
  summary: {
    totalUnassignedTasks: number;
    totalAllocated: number;
    unallocatableTasks: number;
    internsEvaluatedCount: number;
    membersUsedCount: number;
    totalMemberCount: number;
  };
}

export interface GroupAiRecommendationResponse {
  success: boolean;
  data: GroupAiRecommendation;
}

export interface ConfirmGroupAllocationPayload {
  assignments: {
    taskId: string;
    internId: string;
    supportId?: string | null;
  }[];
}

export interface ConfirmGroupAllocationResponse {
  success: boolean;
  message: string;
  count: number;
}
