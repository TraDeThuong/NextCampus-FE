export interface LeaderUser {
    id: string;
    email: string;
    fullName: string | null;
    isActive: boolean;
    avatarUrl: string | null;
}

export interface Leader {
    id: string;
    userId: string;
    departmentId: string | null;
    position: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
    user: LeaderUser;
    department: { id: string; name: string } | null;
    internCount?: number;
}

export interface LeaderSuccessResponse {
    success: boolean;
    data: Leader;
}

export interface LeaderListResponse {
    success: boolean;
    data: Leader[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface LeaderQueryParams {
    fullName?: string;
    departmentId?: string;
    department?: string;
    isActive?: boolean;
    sortBy?: "createdAt" | "fullName";
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
}

export interface CreateLeaderPayload {
    userId: string;
    departmentId?: string;
    position?: string;
    phone?: string;
}

export interface UpdateLeaderPayload {
    departmentId?: string | null;
    position?: string | null;
    phone?: string;
}
