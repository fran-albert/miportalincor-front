import { useQuery } from '@tanstack/react-query';
import { getDoctorAvailabilitiesByDate } from '@/api/DoctorAvailability';
import useUserRole from '@/hooks/useRoles';
import {
  getArgentinaTodayDate,
  getArgentinaWeekDay,
} from '@/common/helpers/argentinaDate';

export const doctorWorkingTodayKeys = {
  all: ['doctorWorkingToday'] as const,
  byDoctorAndDate: (doctorId: number, date: string) =>
    [...doctorWorkingTodayKeys.all, doctorId, date] as const,
};

export const useDoctorWorkingToday = () => {
  const { isDoctor, session } = useUserRole();
  const doctorId = Number(session?.id);
  const enabled = isDoctor && Number.isFinite(doctorId) && doctorId > 0;
  const todayWeekDay = getArgentinaWeekDay();
  const todayDate = getArgentinaTodayDate();

  const query = useQuery({
    queryKey: doctorWorkingTodayKeys.byDoctorAndDate(doctorId, todayDate),
    queryFn: () => getDoctorAvailabilitiesByDate(doctorId, todayDate),
    enabled,
    staleTime: 1000 * 60 * 15,
  });

  const availabilities = query.data ?? [];
  const isWorkingToday = availabilities.length > 0;
  const shouldRestrictWaitingRoom =
    enabled && !query.isLoading && !query.isError && !isWorkingToday;

  return {
    todayDate,
    todayWeekDay,
    availabilities,
    isWorkingToday,
    shouldRestrictWaitingRoom,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
