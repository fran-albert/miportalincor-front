import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllMedia,
  getMediaById,
  uploadMedia,
  updateMedia,
  deleteMedia,
  toggleMediaActive,
  reorderMedia,
} from "@/api/TvMedia";
import type { UpdateTvMediaDto, ReorderMediaDto } from "@/types/TvMedia";

export const tvMediaKeys = {
  all: ["tv-media"] as const,
  lists: () => [...tvMediaKeys.all, "list"] as const,
  list: () => [...tvMediaKeys.lists()] as const,
  details: () => [...tvMediaKeys.all, "detail"] as const,
  detail: (id: number) => [...tvMediaKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los medios
 */
export function useAllMedia() {
  return useQuery({
    queryKey: tvMediaKeys.list(),
    queryFn: getAllMedia,
    staleTime: 30000,
  });
}

/**
 * Hook para obtener un media por ID
 */
export function useMediaById(id: number) {
  return useQuery({
    queryKey: tvMediaKeys.detail(id),
    queryFn: () => getMediaById(id),
    enabled: id > 0,
  });
}

/**
 * Hook para subir un nuevo video
 */
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      title,
      description,
      mediaType,
    }: {
      file: File;
      title: string;
      description?: string;
      mediaType?: "VIDEO" | "IMAGE";
    }) => uploadMedia(file, title, description, mediaType),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: tvMediaKeys.all });
      toast.success("Video subido correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al subir video: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar un media
 */
export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTvMediaDto }) =>
      updateMedia(id, dto),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: tvMediaKeys.all });
      toast.success("Video actualizado");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar un media
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMedia(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: tvMediaKeys.all });
      toast.success("Video eliminado");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
}

/**
 * Hook para toggle activo/inactivo
 */
export function useToggleMediaActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleMediaActive(id),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: tvMediaKeys.all });
      toast.success(data.isActive ? "Video activado" : "Video desactivado");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

/**
 * Hook para reordenar medios
 */
export function useReorderMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ReorderMediaDto) => reorderMedia(dto),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: tvMediaKeys.all });
      toast.success("Orden actualizado");
    },
    onError: (error: Error) => {
      toast.error(`Error al reordenar: ${error.message}`);
    },
  });
}
