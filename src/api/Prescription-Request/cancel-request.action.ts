import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";

export const cancelPrescriptionRequest = async (
  id: string
): Promise<PrescriptionRequest> => {
  await sleep(1);
  const { data } = await apiIncorHC.delete<PrescriptionRequest>(
    `prescription-requests/${id}`
  );
  return data;
};
