import { useQuery } from "@tanstack/react-query";
import {
  getMyVaccinationCard,
  getPatientVaccinationCard,
  getVaccinationCatalog,
} from "@/api/Vaccination/vaccination.action";

interface UsePatientVaccinationCardProps {
  patientUserId: string;
  enabled?: boolean;
}

interface UseMyVaccinationCardProps {
  enabled?: boolean;
}

export const useVaccinationCatalog = (enabled = true) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["vaccination-catalog"],
    queryFn: getVaccinationCatalog,
    staleTime: 1000 * 60 * 30,
    enabled,
  });

  return {
    catalog: data,
    isLoading,
    isFetching,
    error,
  };
};

export const useMyVaccinationCard = ({
  enabled = true,
}: UseMyVaccinationCardProps = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["my-vaccination-card"],
    queryFn: getMyVaccinationCard,
    staleTime: 1000 * 60,
    enabled,
  });

  return {
    vaccinationCard: data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

export const usePatientVaccinationCard = ({
  patientUserId,
  enabled = true,
}: UsePatientVaccinationCardProps) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["patient-vaccination-card", patientUserId],
    queryFn: () => getPatientVaccinationCard(patientUserId),
    staleTime: 1000 * 60,
    enabled: patientUserId !== "" && enabled,
  });

  return {
    vaccinationCard: data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
