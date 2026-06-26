import { apiIncorHC } from "@/services/axiosConfig";
import { AttendanceRecord } from "@/types/Program/Attendance";

export const registerQrAttendance = async (
  qrToken: string
): Promise<AttendanceRecord> => {
  const { data } = await apiIncorHC.post<AttendanceRecord>(
    `/attendance/qr/${qrToken}`
  );
  return data;
};
