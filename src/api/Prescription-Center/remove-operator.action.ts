import { apiIncorHC } from "@/services/axiosConfig";

export const removePrescriptionCenterOperator = async (
  centerId: string,
  userId: string
): Promise<void> => {
  await apiIncorHC.delete(
    `prescription-centers/${centerId}/operators/${userId}`
  );
};
