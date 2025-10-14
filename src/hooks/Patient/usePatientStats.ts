import { useQuery } from "@tanstack/react-query";
import { getStudiesByUserId } from "@/api/Study/get-studies-by-idUser.action";

interface UsePatientStatsProps {
  userId: number;
  isAuthenticated: boolean;
}

export const usePatientStats = ({ userId, isAuthenticated }: UsePatientStatsProps) => {
  // Total de estudios del paciente
  const { data: studies = [], isLoading: isLoadingStudies } = useQuery({
    queryKey: ["patientStudies", userId],
    queryFn: () => getStudiesByUserId(userId),
    enabled: isAuthenticated && userId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const totalStudies = studies.length;

  // TODO: Agregar cuando esté disponible la API de citas
  // const { data: nextAppointment } = useQuery({
  //   queryKey: ["nextAppointment", userId],
  //   queryFn: () => getNextAppointment(userId),
  //   enabled: isAuthenticated && userId > 0,
  // });

  // TODO: Agregar cuando esté disponible la API de visitas
  // const { data: lastVisit } = useQuery({
  //   queryKey: ["lastVisit", userId],
  //   queryFn: () => getLastVisit(userId),
  //   enabled: isAuthenticated && userId > 0,
  // });

  const isLoading = isLoadingStudies;

  return {
    stats: {
      totalStudies,
      lastStudy: studies[0] || null, // El más reciente
      nextAppointment: null, // TODO: implementar
      lastVisit: null, // TODO: implementar
    },
    isLoading,
  };
};
