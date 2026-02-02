import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOverturn,
  changeOverturnStatus,
  deleteOverturn
} from "@/api/Overturns";
import { CreateOverturnDto, OverturnStatus } from "@/types/Overturn/Overturn";

export const useOverturnMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dto: CreateOverturnDto) => createOverturn(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overturns'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      // Sincronizar con la cola y agenda
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStats'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OverturnStatus }) =>
      changeOverturnStatus(id, status),
    onSuccess: (_, variables) => {
      // Invalidar queries de overturns
      queryClient.invalidateQueries({ queryKey: ['overturns'] });
      queryClient.invalidateQueries({ queryKey: ['overturn', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });

      // Sincronizar con la cola
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStats'] });

      // Sincronizar con la agenda del día del médico
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOverturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overturns'] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      // Sincronizar con la cola y agenda
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStats'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
    },
  });

  return {
    createOverturn: createMutation,
    changeStatus: changeStatusMutation,
    deleteOverturn: deleteMutation,
    isCreating: createMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
