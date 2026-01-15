import { apiTurnos } from "@/services/axiosConfig";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";

export const getPatientSchedules = async (patientId: number): Promise<PatientCheckupSchedule[]> => {
  const { data } = await apiTurnos.get<PatientCheckupSchedule[]>(`periodic-checkup/patient/${patientId}`);
  return data;
};

export const getScheduleById = async (id: number): Promise<PatientCheckupSchedule> => {
  const { data } = await apiTurnos.get<PatientCheckupSchedule>(`periodic-checkup/schedule/${id}`);
  return data;
};
