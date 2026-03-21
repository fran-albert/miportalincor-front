import { getMedicalEvaluationReportVersionsByMedicalEvaluationId } from "@/api/Medical-Evaluation-Report-Version/get-by-medical-evaluation.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
  auth?: boolean;
  medicalEvaluationId: number;
}

export const useMedicalEvaluationReportVersions = ({
  auth = true,
  medicalEvaluationId,
}: Props) => {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["medical-evaluation-report-versions", medicalEvaluationId],
    queryFn: () =>
      getMedicalEvaluationReportVersionsByMedicalEvaluationId(medicalEvaluationId),
    staleTime: 0,
    enabled: auth && medicalEvaluationId > 0,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  };
};
