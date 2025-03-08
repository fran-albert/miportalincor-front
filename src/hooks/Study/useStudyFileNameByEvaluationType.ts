import { getStudyFileNameByEvaluationType } from "@/api/Study/Collaborator/get-study-filename-by-evaluation-type.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
  auth: boolean;
  medicalEvaluationId: number;
}

export const useGetStudyFileNameByEvaluationType = ({
  auth = true,
  medicalEvaluationId,
}: Props) => {
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["study-filename-evaluation-type", medicalEvaluationId],
    queryFn: () => getStudyFileNameByEvaluationType(medicalEvaluationId),
    staleTime: 1000 * 60,
    enabled: auth,
  });

  return {
    isLoading,
    isError,
    error,
    data,
  };
};
