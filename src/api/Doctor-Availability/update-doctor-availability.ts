import { apiTurnos } from "@/services/axiosConfig";
import { CreateDoctorAvailabilityDto } from "@/types/Doctor-Availability/Doctor-Availability";

export const updateDoctorAvailability = async (
    id: number,
    dto: Omit<CreateDoctorAvailabilityDto, 'doctorId'>
) => {
    const { data } = await apiTurnos.patch(`/doctor-availability/${id}`, dto);
    return data;
}
