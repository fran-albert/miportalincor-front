import { useState } from "react";
import { ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudyImagesGallery } from "@/components/Studies/StudyImagesGallery";

interface PacsViewerButtonProps {
  studyId: number | string;
  /** Si el estudio no tiene imágenes DICOM en el PACS, el botón no se muestra. */
  studyInstanceUID?: string | null;
}

/**
 * "Ver imágenes": abre la galería de imágenes del estudio (previews JPG del
 * PACS) en un modal. Reemplaza al visor Stone, que quedó dormido porque su
 * proxy DICOMweb no soporta las rutas QIDO que el visor necesita (mismo
 * motivo por el que el editor de informes ya usa galería). Solo aparece
 * cuando el estudio tiene imágenes en el PACS.
 */
export function PacsViewerButton({
  studyId,
  studyInstanceUID,
}: PacsViewerButtonProps) {
  const [open, setOpen] = useState(false);

  if (!studyInstanceUID) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 gap-1 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
        onClick={() => setOpen(true)}
        title="Ver imágenes de la ecografía"
      >
        <ScanEye className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">
          Ver imágenes
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl gap-0 p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle>Imágenes de la ecografía</DialogTitle>
            <DialogDescription>
              Imágenes del estudio tal como se recibieron del ecógrafo.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {open && <StudyImagesGallery studyId={studyId} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
