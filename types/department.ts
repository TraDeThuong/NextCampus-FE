export interface Department {
    id: string;
    name: string;
    positions: { id: string; name: string }[];
}

export interface Position {
    id: string;
    departmentId: string;
    name: string;
}

export interface DepartmentListResponse {
    success: boolean;
    data: Department[];
}

export interface PositionListResponse {
    success: boolean;
    data: Position[];
}
