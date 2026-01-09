import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";

export const takePrescriptionRequest = async (
  id: string
): Promise<PrescriptionRequest> => {
  await sleep(1);
  const { data } = await apiIncorHC.patch<PrescriptionRequest>(
    `prescription-requests/${id}/take`
  );
  return data;
};
