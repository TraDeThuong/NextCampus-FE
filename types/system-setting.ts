export interface SystemSettings {
  AVATAR_MAX_FILE_SIZE_MB: number;
  REPORT_MAX_FILE_SIZE_MB: number;
  REPORT_VIDEO_MAX_FILE_SIZE_MB: number;
  SUBMISSION_ATTACHMENT_MAX_FILE_SIZE_MB: number;
  SUBMISSION_MAX_FILE_SIZE_MB: number;
  TASK_ATTACHMENT_MAX_FILE_SIZE_MB: number;
  APPLICATION_MAX_FILE_SIZE_MB: number;
  TASK_IMPORT_MAX_FILE_SIZE_MB: number;
}

export interface SystemSettingsResponse {
  success: boolean;
  data: SystemSettings;
}
