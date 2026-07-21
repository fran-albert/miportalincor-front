import { useEffect, useMemo, useState } from "react";
import { ImageOff, Maximize2 } from "lucide-react";
import { getStudyReportImages, getStudyReportImagePreview } from "@/api/StudyReport/study-report-images.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const PREVIEW_CONCURRENCY = 4;

interface StudyReportImagesGalleryProps {
  reportId: string;
}

interface GalleryImage {
  instanceId: string;
  url: string | null;
}

type GalleryState =
  | { status: "loading"; images: GalleryImage[] }
  | { status: "error"; images: GalleryImage[] }
  | { status: "ready"; images: GalleryImage[] };

interface PreviewLoadContext {
  isActive: () => boolean;
  createdUrls: string[];
}

const loadPreviewImages = async (
  reportId: string,
  instanceIds: string[],
  context: PreviewLoadContext,
): Promise<GalleryImage[]> => {
  const images: GalleryImage[] = instanceIds.map((instanceId) => ({
    instanceId,
    url: null,
  }));
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < instanceIds.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        const blob = await getStudyReportImagePreview(
          reportId,
          instanceIds[index],
        );
        const url = URL.createObjectURL(blob);
        if (!context.isActive()) {
          URL.revokeObjectURL(url);
          continue;
        }
        context.createdUrls.push(url);
        images[index] = { instanceId: instanceIds[index], url };
      } catch {
        // La miniatura individual puede fallar sin ocultar las demás imágenes.
      }
    }
  };

  const workerCount = Math.min(PREVIEW_CONCURRENCY, instanceIds.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );
  return images;
};

export const StudyReportImagesGallery = ({
  reportId,
}: StudyReportImagesGalleryProps) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<GalleryState>({
    status: "loading",
    images: [],
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const createdUrls: string[] = [];
    const context: PreviewLoadContext = {
      isActive: () => active,
      createdUrls,
    };
    setSelectedIndex(null);
    setState({ status: "loading", images: [] });

    const load = async (): Promise<void> => {
      try {
        const instanceIds = await getStudyReportImages(reportId);
        if (!active) return;
        if (instanceIds.length === 0) {
          setState({ status: "ready", images: [] });
          return;
        }
        const images = await loadPreviewImages(reportId, instanceIds, context);
        if (active) setState({ status: "ready", images });
      } catch {
        if (active) setState({ status: "error", images: [] });
      }
    };

    void load();
    return () => {
      active = false;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [reloadKey, reportId]);

  const selectedImage = useMemo(
    () =>
      selectedIndex === null ? null : state.images[selectedIndex] ?? null,
    [selectedIndex, state.images],
  );

  if (state.status === "loading") {
    return (
      <div className="space-y-3 p-4" aria-label="Cargando imágenes">
        <p className="text-sm text-muted-foreground">Cargando imágenes del estudio…</p>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar las imágenes del estudio.
        </p>
        <Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (state.images.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Sin imágenes para este estudio.</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Imágenes del estudio</p>
            <p className="text-xs text-muted-foreground">
              Seleccioná una miniatura para verla en detalle.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {state.images.length} imágenes
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {state.images.map((image, index) => (
            <div key={image.instanceId} className="space-y-1.5">
              {image.url ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="group relative block h-auto w-full overflow-hidden rounded-lg border p-0 hover:ring-2 hover:ring-emerald-500"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={`Imagen ${index + 1} del estudio`}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/30 group-hover:opacity-100">
                    <Maximize2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                </Button>
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                  <ImageOff className="h-5 w-5" aria-hidden="true" />
                  No se pudo cargar
                </div>
              )}
              <p className="text-center text-xs text-muted-foreground">Imagen {index + 1}</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedImage?.url !== null && selectedImage !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {selectedIndex === null ? "Imagen del estudio" : `Imagen ${selectedIndex + 1}`}
            </DialogTitle>
            <DialogDescription>Vista ampliada del preview del PACS.</DialogDescription>
          </DialogHeader>
          {selectedImage?.url && (
            <img
              src={selectedImage.url}
              alt={selectedIndex === null ? "Imagen del estudio" : `Imagen ${selectedIndex + 1} ampliada`}
              className="max-h-[76vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
