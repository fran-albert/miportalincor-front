import { apiLaboral } from "@/services/axiosConfig";

export const deleteCollaboratorMedicalEvaluation = async (id: number) => {
    const { data } = await apiLaboral.delete<void>(`collaborator-medical-evaluations/${id}`);
    return data;
}
