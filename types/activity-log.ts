export interface ActivityLogActor {
  id: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: {
    name: string;
  } | null;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  actorId?: string | null;
  action: string;
  targetId: string | null;
  targetType: string | null;
  description: string;
  details?: Record<string, unknown> | unknown[] | string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: ActivityLogActor | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role?: {
      name: string;
    } | null;
  };
}

export interface ActivityLogQuery {
  userId?: string;
  actorId?: string;
  search?: string;
  action?: string;
  targetId?: string;
  targetType?: string;
  from?: string;
  to?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ActivityLogResponse {
  success: boolean;
  data: ActivityLog[];
  items?: ActivityLog[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
