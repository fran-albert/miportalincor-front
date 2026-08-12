import { useQuery } from "@tanstack/react-query";
import { getMedicalEvaluation } from "@/api/Program/clinical-intake.actions";

export const useMedicalEvaluation = (
  enrollmentId: string,
  enabled: boolean = true
) => {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["medical-evaluation", enrollmentId],
    queryFn: () => getMedicalEvaluation(enrollmentId),
    staleTime: 1000 * 60,
    enabled: enabled && !!enrollmentId,
  });

  return {
    evaluationDetail: data,
    evaluation: data?.evaluation ?? null,
    completeness: data?.completeness,
    isLoading,
    isError,
    error,
    isFetching,
  };
};
