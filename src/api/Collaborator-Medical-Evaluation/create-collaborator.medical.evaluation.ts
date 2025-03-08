import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";
import { CollaboratorMedicalEvaluation, CollaboratorMedicalEvaluationDto } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";

export const createCollaboratorMedicalEvaluation = async (values: CollaboratorMedicalEvaluationDto) => {
    await sleep(2);
    const { data } = await apiLaboral.post<CollaboratorMedicalEvaluation>(`collaborator-medical-evaluations`, values);
    return data;
}
