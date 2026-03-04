import { apiIncorHC } from "@/services/axiosConfig";
import type { PrescriptionCenterOperator } from "@/types/Prescription-Center/Prescription-Center";

export const addPrescriptionCenterOperator = async (
  centerId: string,
  userId: string
): Promise<PrescriptionCenterOperator> => {
  const { data } = await apiIncorHC.post<PrescriptionCenterOperator>(
    `prescription-centers/${centerId}/operators`,
    { userId }
  );
  return data;
};
