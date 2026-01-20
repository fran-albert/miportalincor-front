import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlockedSlot, deleteBlockedSlot, deleteBlockedSlotBySlot } from "@/api/BlockedSlots";
import { CreateBlockedSlotDto } from "@/types/BlockedSlot/BlockedSlot";
import { useToastContext } from "@/hooks/Toast/toast-context";

export const useBlockedSlotMutations = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastContext();

  const createMutation = useMutation({
    mutationFn: (dto: CreateBlockedSlotDto) => createBlockedSlot(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedSlots"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      showSuccess("Horario bloqueado", "El horario ha sido bloqueado exitosamente");
    },
    onError: (error: Error) => {
      showError("Error", error.message || "No se pudo bloquear el horario");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBlockedSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedSlots"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      showSuccess("Horario desbloqueado", "El horario ha sido desbloqueado");
    },
    onError: (error: Error) => {
      showError("Error", error.message || "No se pudo desbloquear el horario");
    },
  });

  const deleteBySlotMutation = useMutation({
    mutationFn: ({ doctorId, date, hour }: { doctorId: number; date: string; hour: string }) =>
      deleteBlockedSlotBySlot(doctorId, date, hour),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedSlots"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      showSuccess("Horario desbloqueado", "El horario ha sido desbloqueado");
    },
    onError: (error: Error) => {
      showError("Error", error.message || "No se pudo desbloquear el horario");
    },
  });

  return {
    blockSlot: createMutation.mutate,
    blockSlotAsync: createMutation.mutateAsync,
    isBlocking: createMutation.isPending,
    unblockSlot: deleteMutation.mutate,
    unblockSlotAsync: deleteMutation.mutateAsync,
    isUnblocking: deleteMutation.isPending,
    unblockBySlot: deleteBySlotMutation.mutate,
    unblockBySlotAsync: deleteBySlotMutation.mutateAsync,
    isUnblockingBySlot: deleteBySlotMutation.isPending,
  };
};
