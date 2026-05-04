import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOverturn,
  changeOverturnStatus,
  deleteOverturn,
  updateOverturn,
} from "@/api/Overturns";
import {
  CreateOverturnDto,
  OverturnStatus,
  OverturnStatusTransitionContext,
  UpdateOverturnDto,
} from "@/types/Overturn/Overturn";
import { toast } from "sonner";

const getErrorMessage = (error: Error): string =>
  (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
  error.message;

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
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      context,
    }: {
      id: number;
      status: OverturnStatus;
      context?: OverturnStatusTransitionContext;
    }) =>
      changeOverturnStatus(id, { status, context }),
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
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error) || "No se pudo cambiar el estado del sobreturno");
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
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateOverturnDto }) =>
      updateOverturn(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['overturns'] });
      queryClient.invalidateQueries({ queryKey: ['overturn', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
      queryClient.invalidateQueries({ queryKey: ['waitingList'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStats'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
    },
  });

  return {
    createOverturn: createMutation,
    changeStatus: changeStatusMutation,
    deleteOverturn: deleteMutation,
    updateOverturn: updateMutation,
    isCreating: createMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
