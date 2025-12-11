import { apiTurnos } from "@/services/axiosConfig";
import {
  CreateDoctorAvailabilityDto,
  DoctorAvailabilityResponseDto
} from "@/types/DoctorAvailability";

export const createDoctorAvailability = async (
  dto: CreateDoctorAvailabilityDto
): Promise<DoctorAvailabilityResponseDto> => {
  const { data } = await apiTurnos.post<DoctorAvailabilityResponseDto>(
    'doctor-availability',
    dto
  );
  return data;
};
