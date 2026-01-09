import { apiTurnos } from "@/services/axiosConfig";
import { DoctorAvailabilityResponseDto } from "@/types/DoctorAvailability";

export const getDoctorAvailabilityById = async (
  id: number
): Promise<DoctorAvailabilityResponseDto> => {
  const { data } = await apiTurnos.get<DoctorAvailabilityResponseDto>(
    `doctor-availability/${id}`
  );
  return data;
};
