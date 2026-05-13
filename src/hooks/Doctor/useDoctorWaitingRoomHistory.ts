import { useQuery } from "@tanstack/react-query";
import {
  getDoctorWaitingRoomHistory,
  type DoctorWaitingRoomHistoryParams,
  type DoctorWaitingRoomHistoryResponse,
} from "@/api/Doctors/get-waiting-room-history.action";
import useUserRole from "@/hooks/useRoles";
import {
  buildAgendaStats,
  toDoctorWaitingRoomHistoryAgenda,
} from "./useDoctorWaitingRoomHistory.helpers";

export const doctorWaitingRoomHistoryKeys = {
  all: ["doctorWaitingRoomHistory"] as const,
  period: (params: DoctorWaitingRoomHistoryParams) =>
    [
      ...doctorWaitingRoomHistoryKeys.all,
      params.preset ?? "today",
      params.date ?? null,
      params.dateFrom ?? null,
      params.dateTo ?? null,
    ] as const,
};

interface UseDoctorWaitingRoomHistoryOptions {
  params: DoctorWaitingRoomHistoryParams;
  enabled?: boolean;
}

export const useDoctorWaitingRoomHistory = (
  options: UseDoctorWaitingRoomHistoryOptions,
) => {
  const { isDoctor } = useUserRole();
  const enabled = (options.enabled ?? true) && isDoctor;

  const query = useQuery({
    queryKey: doctorWaitingRoomHistoryKeys.period(options.params),
    queryFn: () => getDoctorWaitingRoomHistory(options.params),
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  const agenda = toDoctorWaitingRoomHistoryAgenda(query.data);

  return {
    response: query.data,
    agenda,
    stats: buildAgendaStats(agenda),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export type {
  DoctorWaitingRoomHistoryParams,
  DoctorWaitingRoomHistoryResponse,
};
