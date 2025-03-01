import { apiLaboral } from "@/services/axiosConfig";
import { EvaluationType } from "@/types/Evaluation-Type/Evaluation-Type";

export const getAllEvaluationType = async (): Promise<EvaluationType[]> => {
    const { data } = await apiLaboral.get<EvaluationType[]>(`evaluation-types`);
    return data
}
