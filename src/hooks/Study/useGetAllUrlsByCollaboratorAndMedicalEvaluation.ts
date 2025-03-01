import { getAllUrlsByCollaboratorAndMedicalEvaluation } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    collaboratorId: number;
    medicalEvaluationId: number;
}

export const useGetAllUrlsByCollaboratorAndMedicalEvaluation = ({ auth = true, collaboratorId, medicalEvaluationId }: Props) => {

    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["urls"],
        queryFn: () => getAllUrlsByCollaboratorAndMedicalEvaluation(collaboratorId, medicalEvaluationId),
        staleTime: 1000 * 60,
        enabled: auth
    });

    return {
        isLoading, isError, error, data,
    }

}

