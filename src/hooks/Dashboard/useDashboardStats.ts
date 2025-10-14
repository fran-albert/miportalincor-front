import { useQuery } from "@tanstack/react-query";
import { getTotalPatients } from "@/api/Patient/get-total-patients.action";
import { getLastPatients } from "@/api/Patient/get-last-patients.action";
import { getTotalDoctors } from "@/api/Doctor/get-total-doctors.action";
import { getLastDoctors } from "@/api/Doctor/get-last-doctors.action";
import { getTotalStudies } from "@/api/Study/get-total-studies.action";
import { getLastStudies } from "@/api/Study/get-last-studies.action";

export const useDashboardStats = (isAuthenticated: boolean) => {
  // Total y nuevos pacientes
  const { data: totalPatients = 0, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["totalPatients"],
    queryFn: () => getTotalPatients(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const { data: lastPatients = 0, isLoading: isLoadingLastPatients } = useQuery({
    queryKey: ["lastPatients"],
    queryFn: () => getLastPatients(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  // Total y nuevos médicos
  const { data: totalDoctors = 0, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["totalDoctors"],
    queryFn: () => getTotalDoctors(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const { data: lastDoctors = 0, isLoading: isLoadingLastDoctors } = useQuery({
    queryKey: ["lastDoctors"],
    queryFn: () => getLastDoctors(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  // Total y nuevos estudios
  const { data: totalStudies = 0, isLoading: isLoadingStudies } = useQuery({
    queryKey: ["totalStudies"],
    queryFn: () => getTotalStudies(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const { data: lastStudies = 0, isLoading: isLoadingLastStudies } = useQuery({
    queryKey: ["lastStudies"],
    queryFn: () => getLastStudies(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading =
    isLoadingPatients ||
    isLoadingLastPatients ||
    isLoadingDoctors ||
    isLoadingLastDoctors ||
    isLoadingStudies ||
    isLoadingLastStudies;

  return {
    stats: {
      patients: {
        total: totalPatients,
        lastMonth: lastPatients,
      },
      doctors: {
        total: totalDoctors,
        lastMonth: lastDoctors,
      },
      studies: {
        total: totalStudies,
        lastMonth: lastStudies,
      },
    },
    isLoading,
  };
};
