import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllHolidays, createHoliday, deleteHoliday, syncHolidays } from "@/api/Holiday";
import { CreateHolidayDto } from "@/types/Holiday/Holiday";

const HOLIDAYS_QUERY_KEY = ["holidays"];

export const useHolidays = () => {
  return useQuery({
    queryKey: HOLIDAYS_QUERY_KEY,
    queryFn: getAllHolidays,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHolidayDto) => createHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAYS_QUERY_KEY });
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAYS_QUERY_KEY });
    },
  });
};

export const useSyncHolidays = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (year?: number) => syncHolidays(year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAYS_QUERY_KEY });
    },
  });
};
