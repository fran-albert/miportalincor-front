import { apiTurnos } from "@/services/axiosConfig";
import {
  PatientCheckupSchedule,
  CreatePatientScheduleDto,
  UpdatePatientScheduleDto,
  CompleteCheckupDto,
} from "@/types/Periodic-Checkup/PeriodicCheckup";

export const assignCheckupToPatient = async (
  dto: CreatePatientScheduleDto
): Promise<PatientCheckupSchedule> => {
  const { data } = await apiTurnos.post<PatientCheckupSchedule>(
    "periodic-checkup/patient/assign",
    dto
  );
  return data;
};

export const updatePatientSchedule = async (
  id: number,
  dto: UpdatePatientScheduleDto
): Promise<PatientCheckupSchedule> => {
  const { data } = await apiTurnos.patch<PatientCheckupSchedule>(
    `periodic-checkup/schedule/${id}`,
    dto
  );
  return data;
};

export const deletePatientSchedule = async (id: number): Promise<void> => {
  await apiTurnos.delete(`periodic-checkup/schedule/${id}`);
};

export const completeCheckup = async (
  id: number,
  dto: CompleteCheckupDto
): Promise<PatientCheckupSchedule> => {
  const { data } = await apiTurnos.patch<PatientCheckupSchedule>(
    `periodic-checkup/schedule/${id}/complete`,
    dto
  );
  return data;
};
