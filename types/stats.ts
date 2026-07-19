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

export interface LeaderTeamProgress {
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  departmentName: string;
  totalInterns: number;
  totalAssignments: number;
  assignments: AssignmentStatusStats;
  overdueCount: number;
}

export interface InternTeamProgress {
  internId: string;
  internName: string;
  internEmail: string;
  completedTasks: number;
  totalTasks: number;
  avgScore: number;
  overdueCount: number;
  healthStatus: "HEALTHY" | "WARNING" | "DANGER";
}

export interface InternPersonalStatsData {
  internName: string;
  tasksInProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  dailyReportTodaySubmitted: boolean;
  lastWeekScore: number | null;
  avgScore: number;
  todaysTasks: AssignmentDetail[];
}

export interface ActivityLog {
  id: string;
  type: "SUBMISSION" | "DAILY_REPORT" | "APPLICATION";
  title: string;
  description: string;
  createdAt: string;
}

export interface AdminStatsData {
  system: SystemStats;
  interns: InternStats;
  applications: ApplicationStats;
  tasks: TaskStats;
  assignments: AssignmentStats;
  submissions: SubmissionStats;
  dailyReports: DailyReportStats;
  weeklyEvaluations: WeeklyEvaluationStats;
  notifications: NotificationStats;
  recentAssignments?: AssignmentDetail[];
  overdueAssignments?: AssignmentDetail[];
  leaderTeams?: LeaderTeamProgress[];
  systemCompletionRate?: number;
  recentActivities?: ActivityLog[];
}

export interface LeaderStatsData {
  interns: InternStats;
  assignments: AssignmentStats;
  submissions: SubmissionStats;
  dailyReports: DailyReportStats;
  weeklyEvaluations: WeeklyEvaluationStats;
  recentAssignments?: AssignmentDetail[];
  overdueAssignments?: AssignmentDetail[];
  internProgress?: InternTeamProgress[];
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStatsData;
}

export interface LeaderStatsResponse {
  success: boolean;
  data: LeaderStatsData;
}

export interface InternStatsResponse {
  success: boolean;
  data: InternPersonalStatsData;
}
