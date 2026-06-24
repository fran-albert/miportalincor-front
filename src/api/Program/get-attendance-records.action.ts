import { apiIncorHC } from "@/services/axiosConfig";
import { AttendanceRecord } from "@/types/Program/Attendance";

export const getAttendanceRecords = async (
  enrollmentId: string
): Promise<AttendanceRecord[]> => {
  const { data } = await apiIncorHC.get<AttendanceRecord[]>(
    `/attendance/enrollment/${enrollmentId}`
  );
  return data;
};
