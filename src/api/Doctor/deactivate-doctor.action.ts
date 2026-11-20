import { apiIncorHC } from "@/services/axiosConfig";
import { Doctor } from "@/types/Doctor/Doctor";

/** Cuerpo del 409 cuando el profesional todavía tiene turnos futuros. */
export interface DeactivateDoctorConflict {
  statusCode: number;
  message: string;
  pendingAppointments: number;
  pendingOverturns: number;
  nextDate: string | null;
}

export const deactivateDoctor = async (id: string): Promise<Doctor> => {
  const { data } = await apiIncorHC.patch<Doctor>(`doctor/${id}/deactivate`);
  return data;
};
