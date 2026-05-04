import { apiTurnos } from "@/services/axiosConfig";
import { DoctorAvailabilityResponseDto } from "@/types/DoctorAvailability";

export const getDoctorAvailabilitiesByDate = async (
  doctorId: number,
  date: string
): Promise<DoctorAvailabilityResponseDto[]> => {
  const { data } = await apiTurnos.get<DoctorAvailabilityResponseDto[]>(
    `doctor-availability/doctor/${doctorId}/date`,
    { params: { date } }
  );
  return data;
};
