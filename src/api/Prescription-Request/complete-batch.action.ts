import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import {
  CompletePrescriptionRequestDto,
  PrescriptionRequest,
} from "@/types/Prescription-Request/Prescription-Request";

export const completeBatchPrescriptionRequest = async (
  batchId: string,
  values: CompletePrescriptionRequestDto
): Promise<PrescriptionRequest[]> => {
  await sleep(1);
  const { data } = await apiIncorHC.patch<PrescriptionRequest[]>(
    `prescription-requests/batch/${batchId}/complete`,
    values
  );
  return data;
};
