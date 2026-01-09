import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import {
  CompletePrescriptionRequestDto,
  PrescriptionRequest,
} from "@/types/Prescription-Request/Prescription-Request";

export const completePrescriptionRequest = async (
  id: string,
  values: CompletePrescriptionRequestDto
): Promise<PrescriptionRequest> => {
  await sleep(1);
  const { data } = await apiIncorHC.patch<PrescriptionRequest>(
    `prescription-requests/${id}/complete`,
    values
  );
  return data;
};
