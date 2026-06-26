import { apiIncorHC } from "@/services/axiosConfig";

export const deleteProgramActivity = async (
  programId: string,
  activityId: string
): Promise<void> => {
  await apiIncorHC.delete(
    `/programs/${programId}/activities/${activityId}`
  );
};
