import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";

export const getDoctorRequestHistory = async (): Promise<PrescriptionRequest[]> => {
  await sleep(1);
  const { data } = await apiIncorHC.get<PrescriptionRequest[]>(
    `prescription-requests/doctor/history`
  );
  return data;
};
