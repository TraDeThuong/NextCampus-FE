// ─── NotificationTemplate entity ─────────────────────────────────────────

export interface NotificationTemplate {
  id: string;
  type: string;
  titleTemplate: string;
  contentTemplate: string;
  emailSubjectTemplate: string | null;
  emailContentTemplate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Response wrappers ────────────────────────────────────────────────────

export interface NotificationTemplateSuccessResponse {
  success: boolean;
  data: NotificationTemplate;
}

export interface NotificationTemplateListResponse {
  success: boolean;
  data: NotificationTemplate[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface UpsertNotificationTemplatePayload {
  titleTemplate: string;
  contentTemplate: string;
  emailSubjectTemplate?: string | null;
  emailContentTemplate?: string | null;
}
