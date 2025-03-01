import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";
import { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";

export const getMedicalEvaluationById = async (id: number) => {
    await sleep(2);
    const { data } = await apiLaboral.get<MedicalEvaluation>(`medical-evaluation/${id}`);
    return data;
}
