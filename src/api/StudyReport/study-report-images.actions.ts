import { environment } from "@/config/environment";
import { apiIncorHC } from "@/services/axiosConfig";
import { authStorage } from "@/utils/authStorage";

interface StudyReportImagesResponse {
  instanceIds: string[];
}

export const getStudyReportImages = async (
  reportId: string,
): Promise<string[]> => {
  const { data } = await apiIncorHC.get<StudyReportImagesResponse>(
    `/study-reports/${reportId}/images`,
  );
  return data.instanceIds;
};

export const getStudyReportImagePreview = async (
  reportId: string,
  instanceId: string,
): Promise<Blob> => {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error("No hay una sesión activa para cargar la imagen");
  }

  const response = await fetch(
    `${environment.API_INCOR_HC_URL.replace(/\/$/, "")}/study-reports/${reportId}/images/${encodeURIComponent(instanceId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    throw new Error("No se pudo cargar la imagen del PACS");
  }
  return response.blob();
};
