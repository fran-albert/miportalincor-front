import { apiLaboral } from "@/services/axiosConfig";

export interface GetUrlStudyFileNameByEvaluationType {
  fileName: string;
}

export const getStudyFileNameByEvaluationType = async (
  medicalEvaluationId: number
): Promise<GetUrlStudyFileNameByEvaluationType> => {
  const { data } = await apiLaboral.get<GetUrlStudyFileNameByEvaluationType>(
    `file/study-filename-evaluation-type?medicalEvaluationId=${medicalEvaluationId}`
  );
  return data;
};
