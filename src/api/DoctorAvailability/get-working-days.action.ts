import { apiTurnos } from "@/services/axiosConfig";
import { WeekDays } from "@/types/DoctorAvailability";

export const getDoctorWorkingDays = async (
  doctorId: number
): Promise<WeekDays[]> => {
  const { data } = await apiTurnos.get<WeekDays[]>(
    `doctor-availability/doctor/${doctorId}/working-days`
  );
  return data;
};
