import { apiLaboral } from "@/services/axiosConfig";
import { MedicalEvaluationMaintenanceState } from "@/types/Medical-Evaluation/MedicalEvaluationMaintenance";

export const getMedicalEvaluationMaintenanceState = async (
  id: number
): Promise<MedicalEvaluationMaintenanceState> => {
  const { data } = await apiLaboral.get<MedicalEvaluationMaintenanceState>(
    `medical-evaluation/${id}/maintenance-state`
  );

  return data;
};
