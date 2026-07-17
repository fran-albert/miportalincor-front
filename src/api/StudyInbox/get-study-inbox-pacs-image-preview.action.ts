import { apiIncorHC } from "@/services/axiosConfig";

/**
 * Preview JPEG de una instancia del estudio PACS del item. Va por axios (no
 * por <img src>) porque el endpoint exige el JWT; el componente lo muestra
 * con un object URL.
 */
export const getStudyInboxPacsImagePreview = async (
  id: string,
  instanceId: string,
): Promise<Blob> => {
  const { data } = await apiIncorHC.get<Blob>(
    `/study-inbox/${id}/pacs-images/${instanceId}`,
    { responseType: "blob" },
  );
  return data;
};
