import { apiIncorHC } from "@/services/axiosConfig";
import {
  ConfirmStudyInboxPayload,
  StudyInboxItem,
} from "@/types/StudyInbox/StudyInbox.types";

export const confirmStudyInbox = async (
  id: string,
  payload: ConfirmStudyInboxPayload
): Promise<StudyInboxItem> => {
  const { data } = await apiIncorHC.post<StudyInboxItem>(
    `/study-inbox/${id}/confirm`,
    payload
  );
  return data;
};
