import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudyInboxPacsImages } from "@/api/StudyInbox/get-study-inbox-pacs-images.action";
import { getStudyInboxPacsImagePreview } from "@/api/StudyInbox/get-study-inbox-pacs-image-preview.action";

interface PacsImagesGridProps {
  itemId: string;
}

/**
 * Grilla de previews de las imágenes DICOM del item, para que la secretaria
 * vea QUÉ va a confirmar (aunque no haya llegado el informe). Cada preview
 * baja por axios con el JWT y se muestra vía object URL; click = abrir la
 * imagen grande en otra pestaña.
 */
export const PacsImagesGrid = ({ itemId }: PacsImagesGridProps) => {
  const {
    data: instanceIds,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["study-inbox-pacs-images", itemId],
    queryFn: () => getStudyInboxPacsImages(itemId),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-rose-200 p-4 text-sm text-rose-700">
        <span>No se pudieron cargar las imágenes del estudio.</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Reintentando…" : "Reintentar"}
        </Button>
      </div>
    );
  }

  if (!instanceIds || instanceIds.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
        Sin imágenes en el PACS para este item.
      </p>
    );
  }

  return (
    <div className="grid max-h-[50vh] grid-cols-4 gap-2 overflow-y-auto pr-1">
      {instanceIds.map((instanceId, index) => (
        <PacsThumb
          key={instanceId}
          itemId={itemId}
          instanceId={instanceId}
          index={index}
        />
      ))}
    </div>
  );
};

interface PacsThumbProps {
  itemId: string;
  instanceId: string;
  index: number;
}

const PacsThumb = ({ itemId, instanceId, index }: PacsThumbProps) => {
  const { data: blob } = useQuery({
    queryKey: ["study-inbox-pacs-image", itemId, instanceId],
    queryFn: () => getStudyInboxPacsImagePreview(itemId, instanceId),
    staleTime: Infinity,
  });

  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  if (!objectUrl) {
    return <Skeleton className="aspect-square w-full rounded-md" />;
  }

  return (
    <button
      type="button"
      className="overflow-hidden rounded-md border border-gray-200 transition hover:ring-2 hover:ring-greenPrimary"
      onClick={() => window.open(objectUrl, "_blank")}
      title={`Ver imagen ${index + 1} más grande`}
    >
      <img
        src={objectUrl}
        alt={`Imagen ${index + 1} del estudio`}
        className="aspect-square w-full object-cover"
        loading="lazy"
      />
    </button>
  );
};
