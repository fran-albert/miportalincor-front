import { useQuery } from "@tanstack/react-query";
import { getActivityQr } from "@/api/Program/get-activity-qr.action";

export const useActivityQr = (
  programId: string,
  activityId: string,
  enabled = false
) => {
  const {
    data: qrData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["activity-qr", programId, activityId],
    queryFn: () => getActivityQr(programId, activityId),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!programId && !!activityId,
  });

  return { qrData, isLoading, isError, error };
};
