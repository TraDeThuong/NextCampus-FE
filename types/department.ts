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

export interface CreateDepartmentPayload {
    name: string;
    positions?: string[];
}

export interface UpdateDepartmentPayload {
    name: string;
}

export interface CreatePositionPayload {
    name: string;
    departmentId: string;
}

export interface UpdatePositionPayload {
    name: string;
}

export interface DepartmentSuccessResponse {
    success: boolean;
    data: Department;
}

export interface PositionSuccessResponse {
    success: boolean;
    data: Position;
}

export const PREDEFINED_DEPARTMENTS = [
    "Engineering",
    "Design",
    "Marketing",
    "Data",
    "QA",
    "HR",
    "Product",
    "Finance",
    "Sales",
    "Operations"
];

export const PREDEFINED_POSITIONS: Record<string, string[]> = {
    "Engineering": [
        "Backend Intern",
        "Frontend Intern",
        "Mobile Intern",
        "DevOps Intern",
        "Fullstack Intern",
        "Embedded Intern"
    ],
    "Design": [
        "UI/UX Intern",
        "Graphic Intern",
        "Product Design Intern",
        "Motion Design Intern"
    ],
    "Marketing": [
        "Marketing Intern",
        "Content Creator Intern",
        "SEO Intern",
        "Social Media Intern"
    ],
    "Data": [
        "Data Intern",
        "Data Analyst Intern",
        "Data Engineer Intern",
        "AI/ML Intern"
    ],
    "QA": [
        "QA Intern",
        "Manual QC Intern",
        "Automation Test Intern"
    ],
    "HR": [
        "HR Intern",
        "Recruiter Intern",
        "L&D Intern"
    ],
    "Product": [
        "Product Intern",
        "Product Owner Intern",
        "Product Analyst Intern"
    ]
};

export const GENERAL_POSITIONS = [
    "Intern",
    "Junior Specialist",
    "Associate"
];



