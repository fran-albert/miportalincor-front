import { apiIncorHC } from "@/services/axiosConfig";
import { StudyInboxItem } from "@/types/StudyInbox/StudyInbox.types";

export const holdStudyInbox = async (
  id: string,
  reason: string
): Promise<StudyInboxItem> => {
  const { data } = await apiIncorHC.post<StudyInboxItem>(
    `/study-inbox/${id}/hold`,
    { reason }
  );
  return data;
};
