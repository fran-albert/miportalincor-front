import { apiTurnos } from "@/services/axiosConfig";
import { DoctorAvailabilityResponseDto } from "@/types/DoctorAvailability";

export const getDoctorAvailabilities = async (
  doctorId: number
): Promise<DoctorAvailabilityResponseDto[]> => {
  const { data } = await apiTurnos.get<DoctorAvailabilityResponseDto[]>(
    `doctor-availability/doctor/${doctorId}`
  );
  return data;
};
