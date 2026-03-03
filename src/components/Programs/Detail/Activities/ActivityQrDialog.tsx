import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useActivityQr } from "@/hooks/Program/useActivityQr";

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
  const { qrData, isLoading } = useActivityQr(
    programId,
    activityId,
    isOpen
  );

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
              <div className="rounded-lg border p-4 bg-white">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData.qrUrl)}`}
                  alt={`QR para ${activityName}`}
                  className="h-64 w-64"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Los pacientes pueden escanear este código para registrar su
                asistencia a <strong>{activityName}</strong>.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (printWindow) {
                    printWindow.document.write(`
                      <html><head><title>QR - ${activityName}</title></head>
                      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                        <h2>${qrData.programName}</h2>
                        <h3>${activityName}</h3>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData.qrUrl)}" />
                        <p>Escaneá este QR para registrar tu asistencia</p>
                      </body></html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
              >
                Imprimir QR
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
