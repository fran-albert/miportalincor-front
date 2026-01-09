import { apiTurnos } from "@/services/axiosConfig";
import type { TvMedia, UpdateTvMediaDto, ReorderMediaDto } from "@/types/TvMedia";

/**
 * Obtener todos los medios (admin)
 */
export async function getAllMedia(): Promise<TvMedia[]> {
  const response = await apiTurnos.get<TvMedia[]>("/tv-media/all");
  return response.data;
}

/**
 * Obtener un media por ID
 */
export async function getMediaById(id: number): Promise<TvMedia> {
  const response = await apiTurnos.get<TvMedia>(`/tv-media/${id}`);
  return response.data;
}

/**
 * Subir un nuevo video
 */
export async function uploadMedia(
  file: File,
  title: string,
  description?: string,
  mediaType: "VIDEO" | "IMAGE" = "VIDEO"
): Promise<TvMedia> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (description) {
    formData.append("description", description);
  }
  formData.append("mediaType", mediaType);

  const response = await apiTurnos.post<TvMedia>("/tv-media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Actualizar un media
 */
export async function updateMedia(
  id: number,
  dto: UpdateTvMediaDto
): Promise<TvMedia> {
  const response = await apiTurnos.patch<TvMedia>(`/tv-media/${id}`, dto);
  return response.data;
}

/**
 * Eliminar un media
 */
export async function deleteMedia(id: number): Promise<void> {
  await apiTurnos.delete(`/tv-media/${id}`);
}

/**
 * Toggle activo/inactivo
 */
export async function toggleMediaActive(id: number): Promise<TvMedia> {
  const response = await apiTurnos.patch<TvMedia>(`/tv-media/${id}/toggle`);
  return response.data;
}

/**
 * Reordenar medios
 */
export async function reorderMedia(dto: ReorderMediaDto): Promise<void> {
  await apiTurnos.patch("/tv-media/reorder", dto);
}
