import { apiLaboral } from "@/services/axiosConfig";

export const deleteMedicalEvaluation = async (id: number) => {
  const { data } = await apiLaboral.delete<void>(`medical-evaluation/${id}`);
  return data;
};
