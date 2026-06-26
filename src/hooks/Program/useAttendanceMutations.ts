import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerQrAttendance } from "@/api/Program/register-qr-attendance.action";
import { registerManualAttendance } from "@/api/Program/register-manual-attendance.action";
import { ManualAttendanceDto } from "@/types/Program/Attendance";

export const useAttendanceMutations = () => {
  const queryClient = useQueryClient();

  const qrMutation = useMutation({
    mutationFn: (qrToken: string) => registerQrAttendance(qrToken),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-records", data.enrollmentId],
      });
    },
  });

  const manualMutation = useMutation({
    mutationFn: (dto: ManualAttendanceDto) => registerManualAttendance(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-records", data.enrollmentId],
      });
    },
  });

  return {
    registerQrMutation: qrMutation,
    registerManualMutation: manualMutation,
  };
};
