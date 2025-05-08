import { getAllStudiesImagesUrlsByCollaboratorAndMedicalEvaluation } from "@/api/Study/Collaborator/get-all-studies-images-urls.collaborators.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    collaboratorId: number;
    medicalEvaluationId: number;
}

export const useGetAllStudiesImagesUrlsByCollaboratorAndMedicalEvaluation = ({ auth = true, collaboratorId, medicalEvaluationId }: Props) => {

    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["studies-images-urls"],
        queryFn: () => getAllStudiesImagesUrlsByCollaboratorAndMedicalEvaluation(collaboratorId, medicalEvaluationId),
        staleTime: 0,
        enabled: auth
    });

    return {
        isLoading, isError, error, data,
    }

}

