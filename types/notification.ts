// ─── Notification entity ──────────────────────────────────────────────────

export interface NotificationUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  user: NotificationUser;
}

// ─── Response wrappers ────────────────────────────────────────────────────

export interface NotificationSuccessResponse {
  success: boolean;
  data: Notification;
}

export interface NotificationListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  meta: NotificationListMeta;
}

// ─── Query params ─────────────────────────────────────────────────────────

export interface NotificationQueryParams {
  userId?: string;
  isRead?: boolean;
  type?: string;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateNotificationPayload {
  userId: string;
  title: string;
  content: string;
  type: string;
}
