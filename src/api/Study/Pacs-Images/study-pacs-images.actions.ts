import { environment } from "@/config/environment";
import { apiIncorHC } from "@/services/axiosConfig";
import { authStorage } from "@/utils/authStorage";

interface StudyPacsImagesResponse {
  instanceIds: string[];
}

export const getStudyPacsImages = async (
  studyId: number | string,
): Promise<string[]> => {
  const { data } = await apiIncorHC.get<StudyPacsImagesResponse>(
    `/study/pacsImages/byStudy/${studyId}`,
  );
  return data.instanceIds;
};

export const getStudyPacsImagePreview = async (
  studyId: number | string,
  instanceId: string,
): Promise<Blob> => {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error("No hay una sesión activa para cargar la imagen");
  }

  const response = await fetch(
    `${environment.API_INCOR_HC_URL.replace(/\/$/, "")}/study/pacsImages/byStudy/${studyId}/${encodeURIComponent(instanceId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    throw new Error("No se pudo cargar la imagen del PACS");
  }
  return response.blob();
};
