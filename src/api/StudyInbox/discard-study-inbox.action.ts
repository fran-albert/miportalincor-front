import { apiIncorHC } from "@/services/axiosConfig";
import { StudyInboxItem } from "@/types/StudyInbox/StudyInbox.types";

export const discardStudyInbox = async (
  id: string,
  reason: string
): Promise<StudyInboxItem> => {
  const { data } = await apiIncorHC.post<StudyInboxItem>(
    `/study-inbox/${id}/discard`,
    { reason }
  );
  return data;
};
