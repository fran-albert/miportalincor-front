import { useQuery } from '@tanstack/react-query';
import { getDoctorWaitingQueue } from '@/api/Queue';
import useUserRole from '@/hooks/useRoles';
import type { QueueEntry } from '@/types/Queue';

/**
 * Hook para obtener la cola de espera del médico logueado.
 * Usa el endpoint /queue/waiting que devuelve waitingTimeMinutes calculado por el backend.
 */

export const doctorWaitingQueueKeys = {
  all: ['doctorWaitingQueue'] as const,
  waiting: () => [...doctorWaitingQueueKeys.all, 'waiting'] as const,
};

interface UseDoctorWaitingQueueOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

export const useDoctorWaitingQueue = (options?: UseDoctorWaitingQueueOptions) => {
  const { isDoctor } = useUserRole();
  const refetchInterval = options?.refetchInterval ?? 15000;
  const enabled = (options?.enabled ?? true) && isDoctor;

  const query = useQuery({
    queryKey: doctorWaitingQueueKeys.waiting(),
    queryFn: getDoctorWaitingQueue,
    refetchInterval,
    enabled,
  });

  return {
    waitingQueue: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

export type { QueueEntry };
