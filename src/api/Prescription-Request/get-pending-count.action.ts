import { apiIncorHC } from "@/services/axiosConfig";

export interface PendingCountResponse {
  count: number;
}

export const getDoctorPendingCount = async (): Promise<PendingCountResponse> => {
  const { data } = await apiIncorHC.get<PendingCountResponse>(
    `prescription-requests/pending/count`
  );
  return data;
};
