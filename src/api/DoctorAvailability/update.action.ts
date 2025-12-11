import { apiTurnos } from "@/services/axiosConfig";
import {
  UpdateDoctorAvailabilityDto,
  DoctorAvailabilityResponseDto
} from "@/types/DoctorAvailability";

export const updateDoctorAvailability = async (
  id: number,
  dto: UpdateDoctorAvailabilityDto
): Promise<DoctorAvailabilityResponseDto> => {
  const { data } = await apiTurnos.patch<DoctorAvailabilityResponseDto>(
    `doctor-availability/${id}`,
    dto
  );
  return data;
};
