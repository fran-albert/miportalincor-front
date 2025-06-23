import { apiTurnos } from "@/services/axiosConfig";
import { CreateDoctorAvailabilityDto, DoctorAvailability } from "@/types/Doctor-Availability/Doctor-Availability";

export const createDoctorAvailability = async (dto: CreateDoctorAvailabilityDto) => {
    const { data } = await apiTurnos.post<DoctorAvailability>(`doctor-availability`, dto);
    return data;
}
