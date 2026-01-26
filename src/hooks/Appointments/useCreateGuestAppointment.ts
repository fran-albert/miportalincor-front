import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGuestAppointment,
  CreateGuestAppointmentDto,
} from "@/api/Appointments/create-guest-appointment.action";

export const useCreateGuestAppointment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateGuestAppointmentDto) => createGuestAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
    },
  });

  return {
    createGuestAppointment: mutation,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
