import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSfsStatus } from "@/api/Patient/get-sfs-status.action";
import { syncSfs } from "@/api/Patient/sync-sfs.action";

export const useSfsSync = (patientId: string) => {
  const queryClient = useQueryClient();

  const {
    data: sfsStatus,
    isLoading: isLoadingStatus,
  } = useQuery({
    queryKey: ["sfs-status", patientId],
    queryFn: () => getSfsStatus(patientId),
    staleTime: 1000 * 60 * 5,
    enabled: !!patientId,
  });

  const syncMutation = useMutation({
    mutationFn: () => syncSfs(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sfs-status", patientId] });
    },
  });

  return {
    sfsStatus,
    isLoadingStatus,
    syncMutation,
  };
};
