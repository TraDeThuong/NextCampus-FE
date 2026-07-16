export interface InternUser {
    id: string;
    email: string;
    fullName: string | null;
    isActive: boolean;
}

export interface Intern {
    id: string;
    userId: string;
    leaderId: string | null;
    fullName: string;
    phone: string;
    department: { id: string; name: string } | null;
    position: { id: string; name: string } | null;
    startDate: string;
    duration: number;
    discordUsername: string | null;
    discordRoleGranted: boolean;
    status: "ACTIVE" | "COMPLETED" | "DROPPED";
    createdAt: string;
    updatedAt: string;
    user: InternUser;
    leader: InternUser | null;
}

export interface InternSuccessResponse {
    success: boolean;
    data: Intern;
}

export interface InternListResponse {
    success: boolean;
    data: Intern[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface InternQueryParams {
    fullName?: string;
    departmentId?: string;
    positionId?: string;
    status?: "ACTIVE" | "COMPLETED" | "DROPPED";
    leaderId?: string;
    discordRoleGranted?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    sortBy?: "createdAt" | "fullName" | "startDate" | "status";
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
}

export interface CreateInternPayload {
    userId: string;
    leaderId?: string;
    fullName: string;
    phone: string;
    departmentId: string;
    positionId: string;
    startDate: string;
    duration: number;
    discordUsername?: string;
}

export interface UpdateInternPayload {
    leaderId?: string | null;
    fullName?: string;
    phone?: string;
    departmentId?: string;
    positionId?: string;
    startDate?: string;
    duration?: number;
    discordUsername?: string | null;
    discordRoleGranted?: boolean;
    status?: "ACTIVE" | "COMPLETED" | "DROPPED";
}

export interface UpdateMeInternPayload {
    phone?: string;
    departmentId?: string;
    positionId?: string;
    discordUsername?: string | null;
}
