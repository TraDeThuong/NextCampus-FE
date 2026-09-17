export interface InternStats {
  total: number;
  active: number;
  completed: number;
  dropped: number;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface TaskPriorityStats {
  low: number;
  medium: number;
  high: number;
}

export interface TaskStats {
  total: number;
  overdue: number;
  byPriority: TaskPriorityStats;
}

export interface AssignmentStatusStats {
  pendingApproval: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  blocked: number;
}

export interface AssignmentStats {
  total?: number;
  byStatus: AssignmentStatusStats;
}

export interface SubmissionStats {
  total?: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface DailyReportStats {
  last30Days: number;
  avgPerDay: number;
}

export interface WeeklyEvaluationStats {
  total: number;
  avgScore: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

export interface SystemStats {
  leaders: number;
  departments: number;
  users: number;
}

export interface AssignmentDetail {
  id: string;
  status: string;
  taskTitle: string;
  taskPriority: string;
  taskDeadline: string | null;
  isOverdue: boolean;
  internName: string;
  internEmail: string;
  leaderName: string;
}

export interface DepartmentDistribution {
  departmentId: string;
  departmentName: string;
  internCount: number;
  leaderCount: number;
}

export interface ActionAlert {
  id: string;
  type: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
}

export interface LeaderTeamProgress {
  leaderId: string;
  leaderName: string;
  leaderEmail?: string;
  departmentName: string;
  totalInterns: number;
  activeTasks?: number;
  workloadDays?: number;
  totalAssignments: number;
  assignments: AssignmentStatusStats;
  overdueCount: number;
  riskLevel?: "HEALTHY" | "WARNING" | "DANGER";
}

export interface InternTeamProgress {
  internId: string;
  internName?: string;
  fullName?: string;
  internEmail?: string;
  email?: string;
  avatarUrl?: string | null;
  completedTasks: number;
  totalTasks: number;
  avgScore: number;
  averageScore?: number | null;
  overdueCount?: number;
  overdueTasks?: number;
  completionRate?: number;
  lastReportDate?: string | null;
  healthStatus?: "HEALTHY" | "WARNING" | "DANGER";
}

export interface DailyReportRate {
  todaySubmitted: number;
  totalInterns?: number;
  totalActiveInterns?: number;
  percentage?: number;
  todayRate?: number;
  weeklySubmissionRate?: number;
  weeklyRate?: number;
  riskLevel?: "HEALTHY" | "WARNING" | "DANGER";
}

export interface ActionAlertsCount {
  pendingApplicationsCount: number;
  overdueTasksCount: number;
  droppedInternsCount: number;
}

export interface LeaderWorkload {
  activeWorkloadDays: number;
  activeTasksCount?: number;
  totalAssignmentsCount?: number;
}

export interface InternTaskStats {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  completionRate: number;
}

export interface InternReportStats {
  dailyReportTodaySubmitted: boolean;
  reportStreak: number;
  weeklyReportsSubmitted: number;
  workingDaysCount: number;
}

export interface InternEvaluationStats {
  lastWeekScore: number | null;
  avgScore: number;
  totalEvaluations: number;
}

export interface NeedsReworkItem {
  taskId: string;
  taskTitle: string;
  submissionId: string;
  attempt?: number;
  reviewComment?: string | null;
  rejectedReason?: string | null;
  submittedAt: string;
}

export interface InternPersonalStatsData {
  internId?: string;
  internName: string;
  internCode?: string | null;
  departmentName?: string;
  internshipDays?: number;
  totalDays?: number;
  tasksInProgress?: number;
  tasksCompleted?: number;
  tasksOverdue?: number;
  totalTasks?: number;
  completionRate?: number;
  reportStreak?: number;
  dailyReportTodaySubmitted?: boolean;
  lastWeekScore?: number | null;
  avgScore?: number;
  needsRework?: NeedsReworkItem[];
  todaysTasks?: AssignmentDetail[];
  tasks?: InternTaskStats;
  reports?: InternReportStats;
  evaluations?: InternEvaluationStats;
  recentTasks?: unknown[];
}

export interface ActivityLog {
  id: string;
  type: "SUBMISSION" | "DAILY_REPORT" | "APPLICATION" | string;
  title: string;
  description: string;
  createdAt: string;
}

export interface AdminStatsData {
  system: SystemStats & {
    activeInterns?: number;
    totalInterns?: number;
    completedInterns?: number;
    droppedInterns?: number;
    activeLeaders?: number;
    activeDepartments?: number;
    retentionRate?: number;
  };
  interns?: InternStats;
  applications?: ApplicationStats & {
    pendingApplications?: number;
    approvedApplications?: number;
    rejectedApplications?: number;
    totalApplications?: number;
  };
  tasks?: TaskStats & {
    activeTasks?: number;
    completedTasks?: number;
    overdueTasks?: number;
    totalTasks?: number;
    systemCompletionRate?: number;
  };
  assignments?: AssignmentStats;
  submissions?: SubmissionStats & {
    pendingSubmissions?: number;
    approvedSubmissions?: number;
    rejectedSubmissions?: number;
    totalSubmissions?: number;
  };
  dailyReports?: DailyReportStats;
  weeklyEvaluations?: WeeklyEvaluationStats;
  notifications?: NotificationStats;
  retentionRate?: number;
  departmentDistribution?: DepartmentDistribution[];
  leaderTeams?: LeaderTeamProgress[];
  actionAlerts?: ActionAlert[] | ActionAlertsCount;
  recentAssignments?: AssignmentDetail[];
  overdueAssignments?: AssignmentDetail[];
  systemCompletionRate?: number;
  recentActivities?: ActivityLog[];
}

export interface LeaderStatsData {
  interns: InternStats | { totalInterns: number; activeInterns: number };
  workload?: LeaderWorkload;
  assignments?: AssignmentStats;
  submissions?: SubmissionStats | {
    pendingSubmissionsCount?: number;
    approvedSubmissionsCount?: number;
    rejectedSubmissionsCount?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
  };
  dailyReports?: DailyReportStats;
  weeklyEvaluations?: WeeklyEvaluationStats;
  evaluations?: { totalEvaluations: number; avgScore: number };
  tasksByStatus?: Record<string, number>;
  activeWorkloadDays?: number;
  dailyReportRate?: DailyReportRate;
  recentAssignments?: AssignmentDetail[];
  overdueAssignments?: AssignmentDetail[];
  internProgress?: InternTeamProgress[];
}

// ─── Response wrappers ──────────────────────────────────────────────────────

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStatsData;
  message?: string;
  code?: string;
}

export interface LeaderStatsResponse {
  success: boolean;
  data: LeaderStatsData;
  message?: string;
  code?: string;
}

export interface InternStatsResponse {
  success: boolean;
  data: InternPersonalStatsData;
  message?: string;
  code?: string;
}

