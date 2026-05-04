import { useQuery } from "@tanstack/react-query";
import { getOperationsTodayDashboard } from "@/api/Operations/get-today-dashboard.action";

export const useOperationsTodayDashboard = (enabled: boolean) => {
  return useQuery({
    queryKey: ["operationsTodayDashboard"],
    queryFn: getOperationsTodayDashboard,
    enabled,
    staleTime: 1000 * 30,
    refetchInterval: enabled ? 1000 * 60 : false,
  });
};
