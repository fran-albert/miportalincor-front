import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { pdf } from "@react-pdf/renderer";
import { environment } from "@/config/environment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, QrCode } from "lucide-react";
import { useActivityQr } from "@/hooks/Program/useActivityQr";
import { ActivityQrPosterPdf } from "./ActivityQrPosterPdf";

// Mismo logo que usan los otros PDFs del portal (resumen mensual de programas)
const INCOR_LOGO_URL =
  "https://res.cloudinary.com/dfoqki8kt/image/upload/v1747930109/sxbdhyslwep6ezukcbr2.png";

interface ActivityQrDialogProps {
  programId: string;
  activityId: string;
  activityName: string;
}

export default function ActivityQrDialog({
  programId,
  activityId,
  activityName,
}: ActivityQrDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { qrData, isLoading } = useActivityQr(programId, activityId, isOpen);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadPoster = async () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas || !qrData) return;
    setIsGenerating(true);
    try {
      const qrDataUrl = canvas.toDataURL("image/png");
      const doc = (
        <ActivityQrPosterPdf
          programName={qrData.programName}
          activityName={activityName}
          qrDataUrl={qrDataUrl}
          logoSrc={INCOR_LOGO_URL}
        />
      );
      const blob = await pdf(doc).toBlob();
      const sanitizedActivity = activityName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
      const fileName = `qr_asistencia_${sanitizedActivity}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el póster QR:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver QR">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR - {activityName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {isLoading ? (
            <div className="text-gray-500">Cargando QR...</div>
          ) : qrData ? (
            <>
              <div ref={qrRef} className="rounded-lg border p-4 bg-white">
                <QRCodeCanvas
                  value={`${environment.BASE_URL.replace(/\/$/, "")}${
                    qrData.qrUrl
                  }?actividad=${encodeURIComponent(
                    activityName
                  )}&programa=${encodeURIComponent(qrData.programName)}`}
                  size={250}
                  level="H"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Los pacientes pueden escanear este código para registrar su
                asistencia a <strong>{activityName}</strong> ingresando su DNI,
                sin iniciar sesión.
              </p>
              <Button
                onClick={handleDownloadPoster}
                disabled={isGenerating}
                className="bg-greenPrimary hover:bg-teal-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF para imprimir
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-gray-500">No se pudo obtener el QR.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
