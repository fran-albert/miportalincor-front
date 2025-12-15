import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";

export const getDoctorPendingRequests = async (): Promise<PrescriptionRequest[]> => {
  await sleep(1);
  const { data } = await apiIncorHC.get<PrescriptionRequest[]>(
    `prescription-requests/pending`
  );
  return data;
};
