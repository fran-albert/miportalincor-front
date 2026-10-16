import { useState } from "react";
import { Images, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudiesWithURL } from "@/types/Study/Study";

interface UploadedImagesButtonProps {
  images?: StudiesWithURL["ultrasoundImages"];
}

/**
 * "Imágenes (N)": las imágenes que recepción subió a una eco ya firmada y que
 * quedaron en la historia (`ultrasoundImages`). No son las del PACS: esas las
 * abre `PacsViewerButton`. Solo aparece si el estudio tiene alguna.
 */
export function UploadedImagesButton({ images }: UploadedImagesButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const visibleImages = (images ?? []).filter((image) => !!image.signedUrl);
  if (visibleImages.length === 0) {
    return null;
  }

  const selectedImage =
    selectedIndex === null ? null : visibleImages[selectedIndex] ?? null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 gap-1 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        title="Ver las imágenes de la ecografía"
      >
        <Images className="h-4 w-4" />
        <span className="text-xs font-medium">
          Imágenes ({visibleImages.length})
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-4xl gap-0 p-0"
          onClick={(event) => event.stopPropagation()}
        >
          <DialogHeader className="border-b p-4">
            <DialogTitle>Imágenes de la ecografía</DialogTitle>
            <DialogDescription>
              Seleccioná una miniatura para verla en detalle.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {visibleImages.map((image, index) => (
                <div key={image.id} className="space-y-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    className="group relative block h-auto w-full overflow-hidden rounded-lg border p-0 hover:ring-2 hover:ring-emerald-500"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={image.signedUrl}
                      alt={`Imagen ${index + 1} de la ecografía`}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/30 group-hover:opacity-100">
                      <Maximize2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Imagen {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedImage !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedIndex(null);
        }}
      >
        <DialogContent
          className="max-w-5xl"
          onClick={(event) => event.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedIndex === null
                ? "Imagen de la ecografía"
                : `Imagen ${selectedIndex + 1}`}
            </DialogTitle>
            <DialogDescription>Vista ampliada.</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage.signedUrl}
              alt={`Imagen ${(selectedIndex ?? 0) + 1} ampliada`}
              className="max-h-[76vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
