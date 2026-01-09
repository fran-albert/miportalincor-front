import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import { useRejectPrescriptionRequest } from "@/hooks/Prescription-Request/usePrescriptionRequest";
import { FileText, XCircle, User, AlertTriangle } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface RejectPrescriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PrescriptionRequest | null;
}

export default function RejectPrescriptionRequestModal({
  isOpen,
  onClose,
  request,
}: RejectPrescriptionRequestModalProps) {
  const [reason, setReason] = useState("");

  const rejectMutation = useRejectPrescriptionRequest();
  const { promiseToast, showError } = useToastContext();

  if (!request) return null;

  const handleSubmit = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      showError(
        "Campo requerido",
        "El motivo del rechazo debe tener al menos 10 caracteres"
      );
      return;
    }

    try {
      const promise = rejectMutation.mutateAsync({
        id: String(request.id),
        data: {
          reason: reason.trim(),
        },
      });

      await promiseToast(promise, {
        loading: {
          title: "Rechazando solicitud...",
          description: "Procesando el rechazo",
        },
        success: {
          title: "Solicitud rechazada",
          description: "El paciente sera notificado del rechazo",
        },
        error: (error: unknown) => ({
          title: "Error al rechazar",
          description:
            (error instanceof Error ? error.message : undefined) ||
            "No se pudo rechazar la solicitud",
        }),
      });

      handleClose();
    } catch {
      // Error handled by promiseToast
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Rechazar Solicitud</h2>
              <p className="text-sm text-white/80 mt-1">
                Indique el motivo del rechazo
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Warning */}
          <div className="bg-amber-50 border-l-4 border-l-amber-500 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Esta accion no se puede deshacer
              </p>
              <p className="text-xs text-amber-700 mt-1">
                El paciente sera notificado del rechazo y podra ver el motivo
                que indique.
              </p>
            </div>
          </div>

          {/* Patient Info */}
          {request.patient && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Paciente
                  </p>
                  <p className="text-sm text-gray-600">
                    {request.patient.firstName} {request.patient.lastName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Request Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Solicitud del Paciente
            </Label>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              {request.description}
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label
              htmlFor="reason"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-red-600" />
              Motivo del Rechazo *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique al paciente por que no puede emitir esta receta. Ej: 'No puedo recetar este medicamento sin una consulta presencial previa.'"
              rows={4}
              className="resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={500}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">Minimo 10 caracteres</p>
              <span className="text-gray-400">{reason.length} / 500</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 hover:bg-gray-50"
              disabled={rejectMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={reason.trim().length < 10 || rejectMutation.isPending}
              className="px-6 bg-red-600 hover:bg-red-700 text-white shadow-md min-w-[160px]"
            >
              {rejectMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar Solicitud
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
