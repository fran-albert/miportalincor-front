import { getMedicalEvaluationById } from "@/api/Medical-Evaluation/get-by-id.medical.evaluation";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    id: number
}

export const useMedicalEvaluation = ({ auth, id }: Props) => {

    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['medical-evaluation', id],
        queryFn: () => getMedicalEvaluationById(id as number),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined,
    });


    return {
        data,
        error,
        isLoading,
        isError, isFetching,
    }

}