import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  updateAppointment,
  changeAppointmentStatus,
  deleteAppointment
} from "@/api/Appointments";
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentStatus
} from "@/types/Appointment/Appointment";

export const useAppointmentMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dto: CreateAppointmentDto) => createAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateAppointmentDto }) =>
      updateAppointment(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) =>
      changeAppointmentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
    },
  });

  return {
    createAppointment: createMutation,
    updateAppointment: updateMutation,
    changeStatus: changeStatusMutation,
    deleteAppointment: deleteMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
