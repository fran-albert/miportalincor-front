import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWaitingQueue,
  getActiveQueue,
  getQueueStats,
  callNextPatient,
  callSpecificPatient,
  recallPatient,
  markAsAttending,
  markAsCompleted,
  markAsNoShow,
} from '@/api/Queue';
import type { CallPatientDto, CallSpecificPatientDto } from '@/types/Queue';
import { toast } from 'sonner';

// Query keys
export const queueKeys = {
  all: ['queue'] as const,
  waiting: () => [...queueKeys.all, 'waiting'] as const,
  active: () => [...queueKeys.all, 'active'] as const,
  stats: () => [...queueKeys.all, 'stats'] as const,
};

// Hook para obtener cola de espera
export const useWaitingQueue = () => {
  return useQuery({
    queryKey: queueKeys.waiting(),
    queryFn: getWaitingQueue,
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });
};

// Hook para obtener pacientes activos (llamados/atendiendo)
export const useActiveQueue = () => {
  return useQuery({
    queryKey: queueKeys.active(),
    queryFn: getActiveQueue,
    refetchInterval: 10000,
  });
};

// Hook para estadisticas
export const useQueueStats = () => {
  return useQuery({
    queryKey: queueKeys.stats(),
    queryFn: getQueueStats,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

// Hook para llamar al siguiente paciente
export const useCallNextPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CallPatientDto) => callNextPatient(dto),
    onSuccess: (data) => {
      toast.success(`Llamando a ${data.displayNumber} - ${data.patientName}`);
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al llamar paciente');
    },
  });
};

// Hook para llamar a un paciente especifico
export const useCallSpecificPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CallSpecificPatientDto) => callSpecificPatient(dto),
    onSuccess: (data) => {
      toast.success(`Llamando a ${data.displayNumber} - ${data.patientName}`);
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al llamar paciente');
    },
  });
};

// Hook para re-llamar paciente
export const useRecallPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recallPatient(id),
    onSuccess: (data) => {
      toast.info(`Re-llamando a ${data.displayNumber}`);
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al re-llamar paciente');
    },
  });
};

// Hook para marcar como atendiendo
export const useMarkAsAttending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markAsAttending(id),
    onSuccess: (data) => {
      toast.success(`Atendiendo a ${data.patientName}`);
      // Refetch inmediato para actualizar la UI rápidamente
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al marcar como atendiendo');
    },
  });
};

// Hook para marcar como completado
export const useMarkAsCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markAsCompleted(id),
    onSuccess: () => {
      toast.success('Atención completada');
      // Refetch inmediato para actualizar la UI rápidamente
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al completar atención');
    },
  });
};

// Hook para marcar como no-show
export const useMarkAsNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markAsNoShow(id),
    onSuccess: () => {
      toast.warning('Paciente marcado como ausente');
      // Refetch inmediato para actualizar la UI rápidamente
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al marcar como ausente');
    },
  });
};
