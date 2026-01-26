import { useQuery } from "@tanstack/react-query";
import { getGreenCardById } from "@/api/Green-Card/get-green-card-by-id.action";
import { getMyGreenCard } from "@/api/Green-Card/get-my-green-cards.action";
import { getPatientGreenCard } from "@/api/Green-Card/get-patient-green-cards.action";
import { getOrCreatePatientCard } from "@/api/Green-Card/get-my-card-for-patient.action";
import { getMyCardSummary } from "@/api/Green-Card/get-my-cards-summary.action";

interface UseGreenCardByIdProps {
  cardId: string;
  enabled?: boolean;
}

export const useGreenCardById = ({ cardId, enabled = true }: UseGreenCardByIdProps) => {
  const { isLoading, data: greenCard, isFetching, error } = useQuery({
    queryKey: ["green-card", cardId],
    queryFn: () => getGreenCardById(cardId),
    staleTime: 1000 * 60, // 1 minute
    enabled: cardId !== undefined && cardId !== "" && enabled,
  });

  return {
    greenCard,
    isLoading,
    isFetching,
    error,
  };
};

interface UseMyGreenCardProps {
  enabled?: boolean;
}

// Patient's single green card
export const useMyGreenCard = ({ enabled = true }: UseMyGreenCardProps = {}) => {
  const { isLoading, data: greenCard, isFetching, error, refetch } = useQuery({
    queryKey: ["my-green-card"],
    queryFn: getMyGreenCard,
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });

  return {
    greenCard,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

// Alias for backwards compatibility
export const useMyGreenCards = useMyGreenCard;

interface UsePatientGreenCardProps {
  patientUserId: string;
  enabled?: boolean;
}

// Doctor viewing patient's card
export const usePatientGreenCard = ({ patientUserId, enabled = true }: UsePatientGreenCardProps) => {
  const { isLoading, data: greenCard, isFetching, error, refetch } = useQuery({
    queryKey: ["patient-green-card", patientUserId],
    queryFn: () => getPatientGreenCard(patientUserId),
    staleTime: 1000 * 60, // 1 minute
    enabled: patientUserId !== undefined && patientUserId !== "" && enabled,
  });

  return {
    greenCard,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

// Alias for backwards compatibility (returns single card now, not array)
export const usePatientGreenCards = usePatientGreenCard;

interface UseGetOrCreatePatientCardProps {
  patientUserId: string;
  enabled?: boolean;
}

// Doctor getting/creating patient's card to add medications
export const useGetOrCreatePatientCard = ({ patientUserId, enabled = true }: UseGetOrCreatePatientCardProps) => {
  const { isLoading, data: greenCard, isFetching, error, refetch } = useQuery({
    queryKey: ["patient-green-card-edit", patientUserId],
    queryFn: () => getOrCreatePatientCard(patientUserId),
    staleTime: 1000 * 60, // 1 minute
    enabled: patientUserId !== undefined && patientUserId !== "" && enabled,
  });

  return {
    greenCard,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

// Alias for backwards compatibility
export const useMyCardForPatient = useGetOrCreatePatientCard;

interface UseMyCardSummaryProps {
  enabled?: boolean;
}

export const useMyCardSummary = ({ enabled = true }: UseMyCardSummaryProps = {}) => {
  const { isLoading, data: summary, isFetching, error } = useQuery({
    queryKey: ["my-card-summary"],
    queryFn: getMyCardSummary,
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });

  return {
    summary,
    isLoading,
    isFetching,
    error,
  };
};

// Alias for backwards compatibility
export const useMyCardsSummary = useMyCardSummary;
