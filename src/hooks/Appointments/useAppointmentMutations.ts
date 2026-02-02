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
      queryClient.invalidateQueries({ queryKey: ['patientAppointmentsByUserId'] });
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
      // Invalidar queries de appointments
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointmentsByUserId'] });

      // Sincronizar con la cola
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStats'] });

      // Sincronizar con la agenda del día del médico
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });

      // Cuando se cancela un turno, el slot vuelve a estar disponible
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });

      // Invalidar slots bloqueados por si acaso
      queryClient.invalidateQueries({ queryKey: ['blockedSlots'] });
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
      queryClient.invalidateQueries({ queryKey: ['patientAppointmentsByUserId'] });
      // Sincronizar con la cola y agenda
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStats'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
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
