import { useQuery } from "@tanstack/react-query";
import { getActiveConsultationTypes } from "@/api/ConsultationType";

export const consultationTypeKeys = {
  all: ['consultationTypes'] as const,
  active: () => [...consultationTypeKeys.all, 'active'] as const,
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
