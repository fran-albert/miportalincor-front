import { useQuery } from "@tanstack/react-query";
import { getDashboardStatistics } from "@/api/Statistics/get-dashboard-statistics.action";

export const useDashboardStats = (isAuthenticated: boolean) => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStatistics"],
    queryFn: getDashboardStatistics,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    stats: {
      patients: {
        total: data?.totalPatients ?? 0,
        lastMonth: data?.patientsThisMonth ?? 0,
      },
      doctors: {
        total: data?.totalDoctors ?? 0,
        lastMonth: data?.doctorsThisMonth ?? 0,
      },
      studies: {
        total: 0, // TODO: Agregar cuando esté disponible la migración de estudios
        lastMonth: 0,
      },
    },
    isLoading,
  };
};
