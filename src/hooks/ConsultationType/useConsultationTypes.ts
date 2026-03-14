import { useQuery } from "@tanstack/react-query";
import { getActiveConsultationTypes, getAllConsultationTypes } from "@/api/ConsultationType";

export const consultationTypeKeys = {
  all: ['consultationTypes'] as const,
  list: () => [...consultationTypeKeys.all, 'list'] as const,
  active: () => [...consultationTypeKeys.all, 'active'] as const,
};

export const useAllConsultationTypes = () => {
  const query = useQuery({
    queryKey: consultationTypeKeys.list(),
    queryFn: getAllConsultationTypes,
    staleTime: 5 * 60 * 1000,
  });

  return {
    consultationTypes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook para obtener los tipos de consulta activos.
 * Usado en el formulario de creación de turnos.
 */
export const useConsultationTypes = () => {
  const query = useQuery({
    queryKey: consultationTypeKeys.active(),
    queryFn: getActiveConsultationTypes,
    staleTime: 5 * 60 * 1000, // 5 minutos - los tipos de consulta no cambian frecuentemente
  });

  return {
    consultationTypes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
