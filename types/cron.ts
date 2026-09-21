export interface CronJobItem {
  name: string;
  cron: string;
  description: string;
  isEnabled: boolean;
  nextRun?: string;
  lastRun?: string;
  lastStatus?: string;
}

export interface CronJobListResponse {
  success: boolean;
  data: CronJobItem[];
}

export interface CronJobExecutionResult {
  jobName: string;
  success: boolean;
  durationMs: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface TriggerCronJobResponse {
  success: boolean;
  message: string;
  data: CronJobExecutionResult;
}

export interface TriggerCronJobPayload {
  params?: Record<string, unknown>;
}

export interface ToggleCronJobResponse {
  success: boolean;
  message: string;
  data: {
    jobName: string;
    isEnabled: boolean;
    message: string;
  };
}
