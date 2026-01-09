import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctorWaitingQueue,
  getDoctorQueueStats,
  callSpecificPatient,
  recallPatient,
  markAsAttending,
} from '@/api/Queue';
import type { CallSpecificPatientDto } from '@/types/Queue';
import { toast } from 'sonner';

// Query keys para la cola del doctor
export const doctorQueueKeys = {
  all: ['doctorQueue'] as const,
  waiting: () => [...doctorQueueKeys.all, 'waiting'] as const,
  stats: () => [...doctorQueueKeys.all, 'stats'] as const,
};

/**
 * Hook para obtener la cola de espera del médico logueado.
 * El backend filtra automáticamente por el doctorId del usuario.
 */
export const useDoctorWaitingQueue = () => {
  return useQuery({
    queryKey: doctorQueueKeys.waiting(),
    queryFn: getDoctorWaitingQueue,
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });
};

/**
 * Hook para obtener estadísticas de la cola del médico logueado.
 */
export const useDoctorQueueStats = () => {
  return useQuery({
    queryKey: doctorQueueKeys.stats(),
    queryFn: getDoctorQueueStats,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

/**
 * Hook para que el doctor llame a un paciente específico de su cola.
 */
export const useDoctorCallPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CallSpecificPatientDto) => callSpecificPatient(dto),
    onSuccess: (data) => {
      toast.success(`Llamando a ${data.displayNumber} - ${data.patientName}`);
      queryClient.refetchQueries({ queryKey: doctorQueueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al llamar paciente');
    },
  });
};

/**
 * Hook para que el doctor re-llame a un paciente.
 */
export const useDoctorRecallPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recallPatient(id),
    onSuccess: (data) => {
      toast.info(`Re-llamando a ${data.displayNumber}`);
      queryClient.refetchQueries({ queryKey: doctorQueueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al re-llamar paciente');
    },
  });
};

/**
 * Hook para que el doctor marque a un paciente como atendiendo.
 */
export const useDoctorMarkAsAttending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markAsAttending(id),
    onSuccess: (data) => {
      toast.success(`Atendiendo a ${data.patientName}`);
      queryClient.refetchQueries({ queryKey: doctorQueueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al marcar como atendiendo');
    },
  });
};
