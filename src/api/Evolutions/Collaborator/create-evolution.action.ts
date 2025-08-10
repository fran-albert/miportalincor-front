import { apiLaboral } from "@/services/axiosConfig";
import { CreateEvolutionDto, Evolution } from "@/types/Evolution/Evolution";

export const createEvolution = async (values: CreateEvolutionDto): Promise<Evolution> => {
    const { data } = await apiLaboral.post<Evolution>(`collaborator-medical-evaluations/evolution`, values);
    return data;
}