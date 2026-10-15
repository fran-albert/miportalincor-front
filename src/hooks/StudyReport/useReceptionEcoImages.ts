import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  deleteReceptionEcoImage,
  getReceptionEcoItemImages,
  getReceptionEcoItems,
  uploadReceptionEcoImages,
} from "@/api/StudyReport/reception-eco-images.actions";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  ReceptionEcoItem,
  ReceptionUploadedImage,
} from "@/types/StudyReport/ReceptionEcoImages.types";
import { INBOX_REFRESH_INTERVAL_MS } from "@/hooks/StudyInbox/useStudyInboxCounts";

const ITEMS_KEY = "reception-eco-items";
const IMAGES_KEY = "reception-eco-item-images";

export const useReceptionEcoItems = (params: {
  onlyWithoutImages: boolean;
  search: string;
}): {
  items: ReceptionEcoItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
} => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [ITEMS_KEY, params.onlyWithoutImages, params.search.trim()],
    queryFn: () => getReceptionEcoItems(params),
    refetchInterval: INBOX_REFRESH_INTERVAL_MS,
    staleTime: 1000 * 15,
  });
  return { items: data ?? [], isLoading, isFetching, isError };
};

/** Cuántas ecos esperan imágenes: el número de la pestaña. */
export const useReceptionEcoPendingCount = (): number => {
  const { items } = useReceptionEcoItems({
    onlyWithoutImages: true,
    search: "",
  });
  return items.length;
};

export const useReceptionEcoItemImages = (
  itemId: string | null,
): { images: ReceptionUploadedImage[]; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: [IMAGES_KEY, itemId],
    queryFn: () => getReceptionEcoItemImages(itemId!),
    enabled: Boolean(itemId),
  });
  return { images: data ?? [], isLoading };
};

const apiMessage = (error: unknown): string | undefined => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: unknown } | undefined)
      ?.message;
    if (typeof message === "string") return message;
  }
  return undefined;
};

export const useReceptionEcoImageMutations = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastContext();

  const invalidate = (itemId: string) => {
    void queryClient.invalidateQueries({ queryKey: [ITEMS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [IMAGES_KEY, itemId] });
  };

  const upload = useMutation({
    mutationFn: ({
      itemId,
      files,
      reportIds,
    }: {
      itemId: string;
      files: File[];
      reportIds: string[];
    }) => uploadReceptionEcoImages(itemId, files, reportIds),
    onSuccess: (result, { itemId }) => {
      const detail =
        result.attachedToHistory > 0 && result.pendingSignature === 0
          ? "Se sumaron a la historia del paciente."
          : result.attachedToHistory > 0
            ? "Algunas se sumaron a la historia y otras salen en el PDF cuando la médica firme."
            : "Salen en el PDF cuando la médica firme el informe.";
      showSuccess(
        result.uploaded === 1
          ? "Imagen subida"
          : `${result.uploaded} imágenes subidas`,
        detail,
      );
      invalidate(itemId);
    },
    onError: (error) =>
      showError(
        "No se pudieron subir las imágenes",
        apiMessage(error) ?? "Revisá los archivos e intentá de nuevo.",
      ),
  });

  const remove = useMutation({
    mutationFn: ({ itemId, imageId }: { itemId: string; imageId: string }) =>
      deleteReceptionEcoImage(itemId, imageId),
    onSuccess: (_result, { itemId }) => {
      showSuccess("Imagen borrada");
      invalidate(itemId);
    },
    onError: (error) =>
      showError("No se pudo borrar la imagen", apiMessage(error)),
  });

  return { upload, remove };
};
