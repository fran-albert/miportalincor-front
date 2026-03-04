import { apiIncorHC } from "@/services/axiosConfig";
import { PendingCountResponse } from "./get-pending-count.action";

export const getOperatorPendingCount = async (): Promise<PendingCountResponse> => {
  const { data } = await apiIncorHC.get<PendingCountResponse>(
    `prescription-requests/pending/count`
  );
  return data;
};
