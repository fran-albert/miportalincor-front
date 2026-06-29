import { apiIncorHC } from "@/services/axiosConfig";
import { StudyInboxItem } from "@/types/StudyInbox/StudyInbox.types";

export const releaseStudyInbox = async (
  id: string
): Promise<StudyInboxItem> => {
  const { data } = await apiIncorHC.post<StudyInboxItem>(
    `/study-inbox/${id}/release`,
    {}
  );
  return data;
};
