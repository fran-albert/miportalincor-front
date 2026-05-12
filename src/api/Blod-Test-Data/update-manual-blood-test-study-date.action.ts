import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const updateManualBloodTestStudyDate = async (
  idStudy: string,
  date: string
) => {
  const { data } = await apiIncorHC.patch<BloodTestData[]>(
    `blood-test-data/${idStudy}/date`,
    { date }
  );
  return data;
};
