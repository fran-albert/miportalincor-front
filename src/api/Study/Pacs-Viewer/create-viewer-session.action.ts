import { apiIncorHC } from "@/services/axiosConfig";
import { environment } from "@/config/environment";

export interface PacsViewerSession {
  /** Path relativo a la raíz de la API historia-clinica. */
  viewerPath: string;
  expiresInSeconds: number;
}

/**
 * Crea una sesión del visor DICOM para un estudio (el backend valida que el
 * estudio sea del usuario) y devuelve la URL absoluta del visor, lista para
 * abrir en una pestaña nueva. El token de sesión va en el path — análogo a
 * las signed URLs de S3 — porque la pestaña del visor no manda el JWT.
 */
export const createPacsViewerSession = async (
  studyId: number | string
): Promise<{ viewerUrl: string; expiresInSeconds: number }> => {
  const { data } = await apiIncorHC.post<PacsViewerSession>(
    `pacs-viewer/session/${studyId}`
  );
  const base = environment.API_INCOR_HC_URL.replace(/\/+$/, "");
  return {
    viewerUrl: `${base}/${data.viewerPath}`,
    expiresInSeconds: data.expiresInSeconds,
  };
};
