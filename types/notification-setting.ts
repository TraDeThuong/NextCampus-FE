export interface NotificationSetting {
  id: string;
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  webEnabled: boolean;

  // Event-specific preferences
  taskAssignedEmail: boolean;
  taskAssignedInApp: boolean;
  submissionReviewedEmail: boolean;
  submissionReviewedInApp: boolean;
  dailyReportReminderEmail: boolean;
  dailyReportReminderInApp: boolean;
  meetingScheduleEmail: boolean;
  meetingScheduleInApp: boolean;

  createdAt: string;
  updatedAt: string;
}

export type UpdateNotificationSettingPayload = Partial<
  Omit<NotificationSetting, "id" | "userId" | "createdAt" | "updatedAt">
>;

export interface NotificationSettingResponse {
  success: boolean;
  data: NotificationSetting;
}
