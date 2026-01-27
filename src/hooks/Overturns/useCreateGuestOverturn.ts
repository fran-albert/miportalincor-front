import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGuestOverturn,
  CreateGuestOverturnDto,
} from "@/api/Overturns/create-guest.action";

export const useCreateGuestOverturn = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateGuestOverturnDto) => createGuestOverturn(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overturns'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
    },
  });

  return {
    createGuestOverturn: mutation,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
