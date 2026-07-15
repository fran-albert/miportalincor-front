import { apiIncorHC } from "@/services/axiosConfig";

interface StudyInboxPacsImagesResponse {
  instanceIds: string[];
}

/** Instancias (imágenes) del estudio PACS del item, en orden de examen. */
export const getStudyInboxPacsImages = async (
  id: string,
): Promise<string[]> => {
  const { data } = await apiIncorHC.get<StudyInboxPacsImagesResponse>(
    `/study-inbox/${id}/pacs-images`,
  );
  return data.instanceIds;
};
