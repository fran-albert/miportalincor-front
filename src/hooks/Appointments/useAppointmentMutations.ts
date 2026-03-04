import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  updateAppointment,
  changeAppointmentStatus,
  deleteAppointment,
  rescheduleAppointment,
} from "@/api/Appointments";
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  RescheduleAppointmentDto,
  AppointmentStatus,
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
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: RescheduleAppointmentDto }) =>
      rescheduleAppointment(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointmentsByUserId'] });
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStats'] });
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
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
    },
  });

  return {
    createAppointment: createMutation,
    updateAppointment: updateMutation,
    changeStatus: changeStatusMutation,
    rescheduleAppointment: rescheduleMutation,
    deleteAppointment: deleteMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    isRescheduling: rescheduleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
