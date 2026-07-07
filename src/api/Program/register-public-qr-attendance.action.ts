import { apiIncorHC } from "@/services/axiosConfig";

export interface PublicQrAttendanceResponse {
  firstName: string;
  activityName: string;
  alreadyRegistered: boolean;
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
