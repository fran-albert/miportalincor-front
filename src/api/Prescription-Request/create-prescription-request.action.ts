import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { CreatePrescriptionRequestDto, PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";

export const createPrescriptionRequest = async (
  values: CreatePrescriptionRequestDto
): Promise<PrescriptionRequest> => {
  await sleep(1);
  const { data } = await apiIncorHC.post<PrescriptionRequest>(
    `prescription-requests`,
    values
  );
  return data;
};
