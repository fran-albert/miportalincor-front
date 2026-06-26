import { apiLaboral } from "@/services/axiosConfig";
import { ResponseMedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";
import { UpdateMedicalEvaluationDto } from "@/types/Medical-Evaluation/MedicalEvaluationMaintenance";

export const updateMedicalEvaluation = async (
  id: number,
  values: UpdateMedicalEvaluationDto
): Promise<ResponseMedicalEvaluation> => {
  const { data } = await apiLaboral.patch<ResponseMedicalEvaluation>(
    `medical-evaluation/${id}`,
    values
  );

  return data;
};
