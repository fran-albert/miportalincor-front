import { apiIncorHC } from "@/services/axiosConfig";
import { StudyInboxItem } from "@/types/StudyInbox/StudyInbox.types";

export const ingestStudyInbox = async (
  file: File
): Promise<StudyInboxItem> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiIncorHC.post<StudyInboxItem>(
    `/study-inbox/ingest`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};
