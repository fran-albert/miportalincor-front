import { useQuery } from "@tanstack/react-query";
import {
  getActiveConsultationTypes,
  getAllowedConsultationTypesByDoctor,
  getAllConsultationTypes,
  getOwnConsultationTypesByDoctor,
} from "@/api/ConsultationType";

export const consultationTypeKeys = {
  all: ['consultationTypes'] as const,
  list: () => [...consultationTypeKeys.all, 'list'] as const,
  active: () => [...consultationTypeKeys.all, 'active'] as const,
  allowedByDoctor: (doctorId: number) =>
    [...consultationTypeKeys.all, 'allowed-for-doctor', doctorId] as const,
  ownByDoctor: (doctorId: number) =>
    [...consultationTypeKeys.all, 'own-by-doctor', doctorId] as const,
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
export const useConsultationTypes = (options?: { doctorId?: number }) => {
  const { doctorId } = options ?? {};
  const hasDoctorId = typeof doctorId === "number";
  const enabled = hasDoctorId ? doctorId > 0 : true;

  const query = useQuery({
    queryKey: hasDoctorId
      ? consultationTypeKeys.allowedByDoctor(doctorId)
      : consultationTypeKeys.active(),
    queryFn: () =>
      hasDoctorId
        ? getAllowedConsultationTypesByDoctor(doctorId)
        : getActiveConsultationTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutos - los tipos de consulta no cambian frecuentemente
    enabled,
  });

  return {
    consultationTypes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useOwnConsultationTypes = (doctorId: number, enabled = true) => {
  const query = useQuery({
    queryKey: consultationTypeKeys.ownByDoctor(doctorId),
    queryFn: () => getOwnConsultationTypesByDoctor(doctorId),
    staleTime: 5 * 60 * 1000,
    enabled: enabled && doctorId > 0,
  });

  return {
    consultationTypes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
