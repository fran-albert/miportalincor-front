import { apiIncorHC } from "@/services/axiosConfig";

export const deleteFollowUpEntry = async (
  enrollmentId: string,
  entryId: string
): Promise<void> => {
  await apiIncorHC.delete(`/enrollments/${enrollmentId}/follow-up/${entryId}`);
};
