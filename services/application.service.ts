import api from "@/lib/axios";

export interface CreateApplicationPayload {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    startDate: string;
    duration: number;
}

export async function createApplication(
    payload: CreateApplicationPayload
) {
    const response = await api.post("/applications", payload);

    return response.data;
}
