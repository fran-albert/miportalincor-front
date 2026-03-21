import { apiLaboral } from "@/services/axiosConfig";
import { MedicalEvaluationReportVersion } from "@/types/Medical-Evaluation-Report-Version";

export const markMedicalEvaluationReportVersionAsFinal = async (
  reportVersionId: number
): Promise<MedicalEvaluationReportVersion> => {
  const { data } = await apiLaboral.post<MedicalEvaluationReportVersion>(
    `medical-evaluation-report-versions/${reportVersionId}/mark-final`
  );

  return data;
};
