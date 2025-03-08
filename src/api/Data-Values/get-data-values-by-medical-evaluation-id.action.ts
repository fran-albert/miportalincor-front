import { apiLaboral } from "@/services/axiosConfig";
import { DataValue } from "@/types/Data-Value/Data-Value";

export const getDataValuesByIdMedicalEvaluation = async (id: number) => {
    const { data } = await apiLaboral.get<DataValue[]>(`data-values?medicalEvaluationId=${id}`);
    return data;
}
