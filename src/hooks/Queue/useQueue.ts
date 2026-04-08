import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  getWaitingQueue,
  getActiveQueue,
  getQueueStats,
  callNextPatient,
  callSpecificPatient,
  recallPatient,
  confirmArrival,
  markAsAttending,
  markAsCompleted,
  markAsNoShow,
  registerQueuePatient,
} from '@/api/Queue';
import type {
  CallPatientDto,
  CallSpecificPatientDto,
  QueueEntry,
  RegisterQueuePatientDto,
} from '@/types/Queue';
import type { ApiError } from '@/types/Error/ApiError';
import { toast } from 'sonner';

const ALREADY_REGISTERED_QUEUE_MESSAGE =
  'Esta fila no requiere alta administrativa adicional.';

// Query keys
export const queueKeys = {
  all: ['queue'] as const,
  waiting: () => [...queueKeys.all, 'waiting'] as const,
  active: () => [...queueKeys.all, 'active'] as const,
  stats: () => [...queueKeys.all, 'stats'] as const,
};

const sortActiveQueue = (entries: QueueEntry[]) =>
  [...entries].sort((a, b) => {
    const aTime = a.calledAt ?? a.checkedInAt;
    const bTime = b.calledAt ?? b.checkedInAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

const removeQueueEntry = (entries: QueueEntry[] | undefined, entryId: number) =>
  (entries ?? []).filter((entry) => entry.id !== entryId);

const upsertActiveQueueEntry = (
  entries: QueueEntry[] | undefined,
  nextEntry: QueueEntry,
) => {
  const filtered = removeQueueEntry(entries, nextEntry.id);
  return sortActiveQueue([nextEntry, ...filtered]);
};

const invalidateMedicalFlowQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['appointments'] });
  queryClient.invalidateQueries({ queryKey: ['overturns'] });
  queryClient.invalidateQueries({ queryKey: ['waitingList'] });
  queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
  queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
  queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
  queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
  queryClient.invalidateQueries({ queryKey: ['doctorWaitingQueue'] });
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
      queryClient.setQueryData(queueKeys.waiting(), (current: QueueEntry[] | undefined) =>
        removeQueueEntry(current, data.id),
      );
      queryClient.setQueryData(queueKeys.active(), (current: QueueEntry[] | undefined) =>
        upsertActiveQueueEntry(current, data),
      );
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
      queryClient.setQueryData(queueKeys.waiting(), (current: QueueEntry[] | undefined) =>
        removeQueueEntry(current, data.id),
      );
      queryClient.setQueryData(queueKeys.active(), (current: QueueEntry[] | undefined) =>
        upsertActiveQueueEntry(current, data),
      );
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
      queryClient.setQueryData(queueKeys.active(), (current: QueueEntry[] | undefined) =>
        upsertActiveQueueEntry(current, data),
      );
      toast.info(`Re-llamando a ${data.displayNumber}`);
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al re-llamar paciente');
    },
  });
};

export const useConfirmArrival = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmArrival(id),
    onSuccess: (data) => {
      toast.success(`Paciente pasado a espera médica: ${data.patientName}`);
      queryClient.refetchQueries({ queryKey: queueKeys.all });
      invalidateMedicalFlowQueries(queryClient);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al pasar paciente a espera médica');
    },
  });
};

// Hook para marcar como atendiendo
export const useMarkAsAttending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markAsAttending(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queueKeys.active(), (current: QueueEntry[] | undefined) =>
        upsertActiveQueueEntry(current, data),
      );
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
    onSuccess: (data) => {
      queryClient.setQueryData(queueKeys.active(), (current: QueueEntry[] | undefined) =>
        removeQueueEntry(current, data.id),
      );
      toast.success('Gestión completada');
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
    onSuccess: (data) => {
      queryClient.setQueryData(queueKeys.active(), (current: QueueEntry[] | undefined) =>
        removeQueueEntry(current, data.id),
      );
      toast.warning('Paciente marcado como ausente');
      // Refetch inmediato para actualizar la UI rápidamente
      queryClient.refetchQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al marcar como ausente');
    },
  });
};

export const useRegisterQueuePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegisterQueuePatientDto) => registerQueuePatient(dto),
    onSuccess: () => {
      toast.success('Paciente dado de alta y fila actualizada');
      queryClient.refetchQueries({ queryKey: queueKeys.all });
      invalidateMedicalFlowQueries(queryClient);
    },
    onError: (error: Error) => {
      const apiError = error as ApiError;
      const apiMessage = apiError.response?.data?.message || error.message;

      if (apiMessage === ALREADY_REGISTERED_QUEUE_MESSAGE) {
        return;
      }

      toast.error(apiMessage || 'Error al vincular el paciente a la fila');
    },
  });
};
