import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyTodayAppointments } from '@/api/Appointments';
import { getMyTodayOverturns } from '@/api/Overturns';
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
  PatientBasicDto,
} from '@/types/Appointment/Appointment';
import { OverturnDetailedDto, OverturnStatus } from '@/types/Overturn/Overturn';

// ============================================
// TYPES
// ============================================

export type AgendaItemType = 'appointment' | 'overturn';

export type AgendaItemStatus = AppointmentStatus | OverturnStatus;

export interface AgendaItem {
  id: number;
  type: AgendaItemType;
  hour: string;
  date: string;
  status: AgendaItemStatus;
  patient: PatientBasicDto | null;
  rawData: AppointmentFullResponseDto | OverturnDetailedDto;
}

export interface AgendaStats {
  total: number;
  pending: number;
  waiting: number;
  attending: number;
  completed: number;
  cancelled: number;
}

// ============================================
// QUERY KEYS
// ============================================

export const doctorAgendaKeys = {
  all: ['doctorAgenda'] as const,
  today: () => [...doctorAgendaKeys.all, 'today'] as const,
  appointments: () => [...doctorAgendaKeys.today(), 'appointments'] as const,
  overturns: () => [...doctorAgendaKeys.today(), 'overturns'] as const,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const isPending = (status: AgendaItemStatus): boolean =>
  status === AppointmentStatus.PENDING ||
  status === OverturnStatus.PENDING ||
  status === AppointmentStatus.REQUESTED_BY_PATIENT ||
  status === AppointmentStatus.ASSIGNED_BY_SECRETARY;

const isWaiting = (status: AgendaItemStatus): boolean =>
  status === AppointmentStatus.WAITING || status === OverturnStatus.WAITING;

const isAttending = (status: AgendaItemStatus): boolean =>
  status === AppointmentStatus.ATTENDING || status === OverturnStatus.ATTENDING;

const isCompleted = (status: AgendaItemStatus): boolean =>
  status === AppointmentStatus.COMPLETED || status === OverturnStatus.COMPLETED;

const isCancelled = (status: AgendaItemStatus): boolean =>
  status === AppointmentStatus.CANCELLED_BY_PATIENT ||
  status === AppointmentStatus.CANCELLED_BY_SECRETARY ||
  status === OverturnStatus.CANCELLED_BY_PATIENT ||
  status === OverturnStatus.CANCELLED_BY_SECRETARY;

// ============================================
// HOOK
// ============================================

interface UseDoctorDayAgendaOptions {
  refetchInterval?: number;
}

export const useDoctorDayAgenda = (options?: UseDoctorDayAgendaOptions) => {
  const queryClient = useQueryClient();
  const refetchInterval = options?.refetchInterval ?? 30000;

  // Query para appointments
  const appointmentsQuery = useQuery({
    queryKey: doctorAgendaKeys.appointments(),
    queryFn: getMyTodayAppointments,
    refetchInterval,
  });

  // Query para overturns
  const overturnsQuery = useQuery({
    queryKey: doctorAgendaKeys.overturns(),
    queryFn: getMyTodayOverturns,
    refetchInterval,
  });

  // Combinar y ordenar por hora
  const agenda: AgendaItem[] = [
    ...(appointmentsQuery.data?.map((apt): AgendaItem => ({
      id: apt.id,
      type: 'appointment',
      hour: apt.hour,
      date: apt.date,
      status: apt.status,
      patient: apt.patient ?? null,
      rawData: apt,
    })) ?? []),
    ...(overturnsQuery.data?.map((ot): AgendaItem => ({
      id: ot.id,
      type: 'overturn',
      hour: ot.hour,
      date: ot.date,
      status: ot.status,
      patient: ot.patient ?? null,
      rawData: ot,
    })) ?? []),
  ].sort((a, b) => a.hour.localeCompare(b.hour));

  // Calcular estadisticas
  const stats: AgendaStats = {
    total: agenda.length,
    pending: agenda.filter((i) => isPending(i.status)).length,
    waiting: agenda.filter((i) => isWaiting(i.status)).length,
    attending: agenda.filter((i) => isAttending(i.status)).length,
    completed: agenda.filter((i) => isCompleted(i.status)).length,
    cancelled: agenda.filter((i) => isCancelled(i.status)).length,
  };

  // Agrupar por estado para facilitar el renderizado
  const pendingItems = agenda.filter((i) => isPending(i.status));
  const activeItems = agenda.filter((i) => isWaiting(i.status) || isAttending(i.status));
  const completedItems = agenda.filter((i) => isCompleted(i.status) || isCancelled(i.status));

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: doctorAgendaKeys.today() });
  };

  return {
    // Data
    agenda,
    pendingItems,
    activeItems,
    completedItems,
    stats,

    // Raw data
    appointments: appointmentsQuery.data ?? [],
    overturns: overturnsQuery.data ?? [],

    // Status
    isLoading: appointmentsQuery.isLoading || overturnsQuery.isLoading,
    isFetching: appointmentsQuery.isFetching || overturnsQuery.isFetching,
    error: appointmentsQuery.error || overturnsQuery.error,

    // Actions
    refetch,
  };
};

// ============================================
// HELPER EXPORTS
// ============================================

export { isPending, isWaiting, isAttending, isCompleted, isCancelled };
