import { apiIncorHC } from "@/services/axiosConfig";
import { StudyInboxCountsResponse } from "@/types/StudyInbox/StudyInbox.types";

export const getStudyInboxCounts =
  async (): Promise<StudyInboxCountsResponse> => {
    const { data } = await apiIncorHC.get<StudyInboxCountsResponse>(
      "/study-inbox/counts"
    );
    return data;
  };
