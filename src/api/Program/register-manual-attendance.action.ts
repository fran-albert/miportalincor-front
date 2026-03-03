import { apiIncorHC } from "@/services/axiosConfig";
import {
  ManualAttendanceDto,
  AttendanceRecord,
} from "@/types/Program/Attendance";

export const registerManualAttendance = async (
  dto: ManualAttendanceDto
): Promise<AttendanceRecord> => {
  const { data } = await apiIncorHC.post<AttendanceRecord>(
    "/attendance/manual",
    dto
  );
  return data;
};
