import { apiIncorHC } from "@/services/axiosConfig";

export interface SfsStatusResponse {
  hasData: boolean;
  count: number;
  alreadySynced: boolean;
}

export const getSfsStatus = async (
  patientId: string
): Promise<SfsStatusResponse> => {
  const { data } = await apiIncorHC.get<SfsStatusResponse>(
    `patient/${patientId}/sfs-status`
  );
  return data;
};
