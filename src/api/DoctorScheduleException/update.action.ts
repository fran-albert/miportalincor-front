import { apiTurnos } from "@/services/axiosConfig";
import {
  DoctorScheduleExceptionResponseDto,
  UpdateDoctorScheduleExceptionDto,
} from "@/types/DoctorScheduleException";

export const updateDoctorScheduleException = async (
  id: number,
  dto: UpdateDoctorScheduleExceptionDto,
): Promise<DoctorScheduleExceptionResponseDto> => {
  const { data } = await apiTurnos.patch<DoctorScheduleExceptionResponseDto>(
    `doctor-schedule-exceptions/${id}`,
    dto,
  );

  return data;
};
