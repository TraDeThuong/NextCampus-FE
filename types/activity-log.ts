export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  description: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: {
      name: string;
    };
  };
}

export interface ActivityLogQuery {
  userId?: string;
  action?: string;
  targetId?: string;
  targetType?: string;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ActivityLogResponse {
  success: boolean;
  data: ActivityLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
