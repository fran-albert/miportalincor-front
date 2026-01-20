import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convertGuestToPatient } from "@/api/Appointments";

interface ConvertGuestParams {
  appointmentId: number;
  patientId: number;
}

export const useConvertGuest = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ appointmentId, patientId }: ConvertGuestParams) =>
      convertGuestToPatient(appointmentId, patientId),
    onSuccess: () => {
      // Invalidate and refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['waitingList'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['patientAppointmentsByUserId'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['queue'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['queueStats'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'], refetchType: 'all' });
    },
  });

  return {
    convertGuest: mutation,
    isConverting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
