import { slugify } from "@/common/helpers/helpers";
import { Doctor } from "@/types/Doctor/Doctor";
import { apiIncorHC } from "@/services/axiosConfig";

interface PaginatedDoctorResponse {
    data: Doctor[];
    total: number;
    page: number;
    limit: number;
}

export const getDoctors = async (page: number = 1, limit: number = 5): Promise<Doctor[]> => {
    const params = new URLSearchParams();
    params.append('page', `${page}`);
    params.append('limit', `${limit}`);

    const { data } = await apiIncorHC.get<PaginatedDoctorResponse>(`doctor/search`, { params });
    const doctorWithSlugs = data.data.map(doctor => ({
        ...doctor,
        slug: slugify(`${doctor.firstName} ${doctor.lastName}`, doctor.id)
    }));

    return doctorWithSlugs;
}
