import { apiIncorHC } from "@/services/axiosConfig";

interface PaginatedDoctorResponse {
    data: unknown[];
    total: number;
    page: number;
    limit: number;
}

export const getTotalDoctors = async (): Promise<number> => {
    const { data } = await apiIncorHC.get<PaginatedDoctorResponse>(`doctor/search`, {
        params: { page: 1, limit: 1 }
    });
    return data.total;
}