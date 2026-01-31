import { apiTurnos } from "@/services/axiosConfig";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";

export const getMyCheckupSchedules = async (userId: string | number): Promise<PatientCheckupSchedule[]> => {
  const { data } = await apiTurnos.get<PatientCheckupSchedule[]>(`periodic-checkup/patient/${userId}`);
  return data;
};
