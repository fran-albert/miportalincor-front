import { apiIncorHC } from "@/services/axiosConfig";
import { StudyInboxDetail } from "@/types/StudyInbox/StudyInbox.types";

export const getStudyInboxDetail = async (
  id: string
): Promise<StudyInboxDetail> => {
  const { data } = await apiIncorHC.get<StudyInboxDetail>(`/study-inbox/${id}`);
  return data;
};
