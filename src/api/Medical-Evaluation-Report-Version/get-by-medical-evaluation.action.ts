import { apiLaboral } from "@/services/axiosConfig";
import { MedicalEvaluationReportVersionsSummary } from "@/types/Medical-Evaluation-Report-Version";

export const getMedicalEvaluationReportVersionsByMedicalEvaluationId = async (
  medicalEvaluationId: number
): Promise<MedicalEvaluationReportVersionsSummary> => {
  const { data } = await apiLaboral.get<MedicalEvaluationReportVersionsSummary>(
    `medical-evaluation-report-versions/exam/${medicalEvaluationId}`
  );

  return data;
};
