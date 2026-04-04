import { apiTurnos } from "@/services/axiosConfig";
import {
  CreateDoctorScheduleExceptionDto,
  DoctorScheduleExceptionResponseDto,
} from "@/types/DoctorScheduleException";

export const createDoctorScheduleException = async (
  dto: CreateDoctorScheduleExceptionDto,
): Promise<DoctorScheduleExceptionResponseDto> => {
  const { data } = await apiTurnos.post<DoctorScheduleExceptionResponseDto>(
    "doctor-schedule-exceptions",
    dto,
  );

  return data;
};
