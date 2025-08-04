import { apiLaboral } from "@/services/axiosConfig";
import { Evolution } from "@/types/Evolution/Evolution";

export const getEvolutionsByCollaboratorId = async (collaboratorId: number): Promise<Evolution[]> => {
    const { data } = await apiLaboral.get<Evolution[]>(`collaborator-medical-evaluations/${collaboratorId}/evolutions`);
    return data;
}