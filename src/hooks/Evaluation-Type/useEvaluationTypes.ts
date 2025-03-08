import { useQuery } from "@tanstack/react-query"
import { getAllEvaluationType } from "@/api/Evaluation-Type/get-all-evaluation-type.action";

interface Props {
    auth?: boolean;
}

export const useEvaluationType = ({ auth = true }: Props) => {

    const { isLoading, isError, error, data: evaluationTypes = [], isFetching } = useQuery({
        queryKey: ['evaluation-types'],
        queryFn: () => getAllEvaluationType(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    return {
        isLoading, isError, error, evaluationTypes, isFetching
    }

}