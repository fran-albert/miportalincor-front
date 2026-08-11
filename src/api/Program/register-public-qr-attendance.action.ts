import { apiIncorHC } from "@/services/axiosConfig";

export interface PublicQrAttendanceResponse {
  firstName: string;
  activityName: string;
  alreadyRegistered: boolean;
  /**
   * El paciente no tiene plan vigente hoy. Es un aviso: la asistencia se
   * registró igual y el mostrador no se frena.
   */
  withoutActivePlan?: boolean;
}

export const registerPublicQrAttendance = async (
  qrToken: string,
  dni: string
): Promise<PublicQrAttendanceResponse> => {
  const { data } = await apiIncorHC.post<PublicQrAttendanceResponse>(
    `attendance/qr/${qrToken}/public`,
    { dni }
  );
  return data;
};
