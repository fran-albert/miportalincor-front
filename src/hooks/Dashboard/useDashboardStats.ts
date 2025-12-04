import { useQuery } from "@tanstack/react-query";
import { getDashboardStatistics } from "@/api/Statistics/get-dashboard-statistics.action";
import { getCompanyCount } from "@/api/Company/get-total-company.action";

export const useDashboardStats = (isAuthenticated: boolean) => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStatistics"],
    queryFn: getDashboardStatistics,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const { data: companyCount, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companyCount"],
    queryFn: getCompanyCount,
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
        total: data?.totalStudies ?? 0,
        lastMonth: data?.studiesThisMonth ?? 0,
      },
      companies: {
        total: companyCount ?? 0,
      },
    },
    isLoading: isLoading || isLoadingCompanies,
  };
};
