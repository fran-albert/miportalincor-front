import { apiTurnos } from "@/services/axiosConfig";
import { DoctorAvailability } from "@/types/Doctor-Availability/Doctor-Availability";

export const getDoctorAvailabilityById = async (id: number) => {
    const { data } = await apiTurnos.get<DoctorAvailability[]>(`doctor-availability/doctor/${id}`);
    return data;
}
