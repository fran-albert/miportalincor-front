import { getDataValuesByIdMedicalEvaluation } from "@/api/Data-Values/get-data-values-by-medical-evaluation-id.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    id: number
}

export const useDataValuesByMedicalEvaluationId = ({ auth, id }: Props) => {

    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['data-values', id],
        queryFn: () => getDataValuesByIdMedicalEvaluation(id as number),
        staleTime: 0,
        enabled: auth && id !== undefined,
    });

    return {
        data,
        error,
        isLoading,
        isError, isFetching,
    }

}