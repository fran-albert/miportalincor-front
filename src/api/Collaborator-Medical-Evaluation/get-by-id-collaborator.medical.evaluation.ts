import { apiLaboral } from "@/services/axiosConfig";
import { CollaboratorMedicalEvaluation } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";

export const getByIdCollaboratorMedicalEvaluation = async (id: number) => {
    const { data } = await apiLaboral.get<CollaboratorMedicalEvaluation[]>(`collaborator-medical-evaluations/${id}`);
    return data;
}
