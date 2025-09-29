import { getUserHistoriaClinica } from "@/api/User-Historia-Clinica/get-user-historia-clinica.action";
import { MedicacionActualQueryParams } from "@/types/Antecedentes/Antecedentes";
import { useQuery } from "@tanstack/react-query";

interface UseAntecedentesProps {
  auth: boolean;
  userId: number;
}

interface UseMedicacionActualProps {
  auth: boolean;
  userId: number;
  queryParams?: MedicacionActualQueryParams;
}

interface UseEvolucionesProps {
  auth: boolean;
  userId: number;
}

export const useAntecedentes = ({ auth, userId }: UseAntecedentesProps) => {
  const { isLoading, isError, error, data: antecedentes, isFetching } = useQuery({
    queryKey: ['historia-clinica', userId, 'antecedentes'],
    queryFn: () => getUserHistoriaClinica(userId, 'antecedentes'),
    staleTime: 1000 * 60,
    enabled: auth && !!userId,
  });

  return {
    antecedentes,
    error,
    isLoading,
    isError,
    isFetching,
  };
};

export const useMedicacionActual = ({ auth, userId, queryParams }: UseMedicacionActualProps) => {
  const { isLoading, isError, error, data: medicacionActual, isFetching } = useQuery({
    queryKey: ['historia-clinica', userId, 'medicacion-actual', queryParams],
    queryFn: () => getUserHistoriaClinica(userId, 'medicacion-actual', queryParams),
    staleTime: 1000 * 60,
    enabled: auth && !!userId,
  });

  return {
    medicacionActual,
    error,
    isLoading,
    isError,
    isFetching,
  };
};

export const useEvoluciones = ({ auth, userId }: UseEvolucionesProps) => {
  const { isLoading, isError, error, data: evoluciones, isFetching } = useQuery({
    queryKey: ['historia-clinica', userId, 'evoluciones'],
    queryFn: () => getUserHistoriaClinica(userId, 'evoluciones'),
    staleTime: 1000 * 60,
    enabled: auth && !!userId,
  });

  return {
    evoluciones,
    error,
    isLoading,
    isError,
    isFetching,
  };
};