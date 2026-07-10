import { useState } from "react";
import { ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPacsViewerSession } from "@/api/Study/Pacs-Viewer/create-viewer-session.action";

interface PacsViewerButtonProps {
  studyId: number | string;
  /** Si el estudio no tiene imágenes DICOM en el PACS, el botón no se muestra. */
  studyInstanceUID?: string | null;
}

/**
 * "Ver imágenes": abre el visor DICOM (Stone Web Viewer, servido por el
 * proxy autorizado del backend) en una pestaña nueva. Solo aparece cuando
 * el estudio tiene imágenes en el PACS; la vista actual de PDF/JPGs no
 * cambia.
 */
export function PacsViewerButton({
  studyId,
  studyInstanceUID,
}: PacsViewerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!studyInstanceUID) {
    return null;
  }

  const handleOpenViewer = async () => {
    // La pestaña se abre ANTES del await: si no, el popup blocker la frena.
    const viewerWindow = window.open("", "_blank");
    setIsLoading(true);
    try {
      const { viewerUrl } = await createPacsViewerSession(studyId);
      if (viewerWindow) {
        viewerWindow.location.href = viewerUrl;
      } else {
        window.open(viewerUrl, "_blank");
      }
    } catch {
      viewerWindow?.close();
      toast.error("No se pudieron abrir las imágenes", {
        description: "Reintentá en unos segundos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 gap-1 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
      onClick={() => void handleOpenViewer()}
      disabled={isLoading}
      title="Ver imágenes de la ecografía"
    >
      <ScanEye className="h-4 w-4" />
      <span className="hidden sm:inline text-xs font-medium">
        {isLoading ? "Abriendo…" : "Ver imágenes"}
      </span>
    </Button>
  );
}
