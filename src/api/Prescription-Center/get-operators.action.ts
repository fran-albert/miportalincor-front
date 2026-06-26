import { apiIncorHC } from "@/services/axiosConfig";
import type { PrescriptionCenterOperator } from "@/types/Prescription-Center/Prescription-Center";

export const getPrescriptionCenterOperators = async (
  centerId: string
): Promise<PrescriptionCenterOperator[]> => {
  const { data } = await apiIncorHC.get<PrescriptionCenterOperator[]>(
    `prescription-centers/${centerId}/operators`
  );
  return data;
};
