import { apiTurnos } from "@/services/axiosConfig";
import { DoctorScheduleExceptionResponseDto } from "@/types/DoctorScheduleException";

export const getDoctorScheduleExceptions = async (
  doctorId: number,
): Promise<DoctorScheduleExceptionResponseDto[]> => {
  const { data } = await apiTurnos.get<DoctorScheduleExceptionResponseDto[]>(
    `doctor-schedule-exceptions/doctor/${doctorId}`,
  );

  return data;
};
