import { apiIncorHC } from "@/services/axiosConfig";
import type { PrescriptionCenter } from "@/types/Prescription-Center/Prescription-Center";

export const getPrescriptionCenters = async (): Promise<
  PrescriptionCenter[]
> => {
  const { data } = await apiIncorHC.get<PrescriptionCenter[]>(
    "prescription-centers"
  );
  return data;
};
