import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import {
  RejectPrescriptionRequestDto,
  PrescriptionRequest,
} from "@/types/Prescription-Request/Prescription-Request";

export const rejectPrescriptionRequest = async (
  id: string,
  values: RejectPrescriptionRequestDto
): Promise<PrescriptionRequest> => {
  await sleep(1);
  const { data } = await apiIncorHC.patch<PrescriptionRequest>(
    `prescription-requests/${id}/reject`,
    values
  );
  return data;
};
