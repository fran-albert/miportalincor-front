import { getByIdCollaboratorMedicalEvaluation } from "@/api/Collaborator-Medical-Evaluation/get-by-id-collaborator.medical.evaluation";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    id: number;
    enabled?: boolean;
}

export const useCollaboratorMedicalEvaluation = ({ auth, id, enabled = true }: Props) => {

    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['collaborator-medical-evaluation', id],
        queryFn: () => getByIdCollaboratorMedicalEvaluation(id as number),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined && enabled,
    });

    return {
        data,
        error,
        isLoading,
        isError, isFetching,
    }

}