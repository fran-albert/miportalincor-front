import { apiIncorHC } from "@/services/axiosConfig";

export interface ActivityQrResponse {
  qrToken: string;
  activityName: string;
  programName: string;
  qrUrl: string;
}

export const getActivityQr = async (
  programId: string,
  activityId: string
): Promise<ActivityQrResponse> => {
  const { data } = await apiIncorHC.get<ActivityQrResponse>(
    `/programs/${programId}/activities/${activityId}/qr`
  );
  return data;
};
