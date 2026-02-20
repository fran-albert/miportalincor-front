import { apiIncorHC } from "@/services/axiosConfig";

export interface SfsSyncResponse {
  migratedCount: number;
  skippedCount: number;
  message: string;
}

export const syncSfs = async (
  patientId: string
): Promise<SfsSyncResponse> => {
  const { data } = await apiIncorHC.post<SfsSyncResponse>(
    `patient/${patientId}/sync-sfs`
  );
  return data;
};
