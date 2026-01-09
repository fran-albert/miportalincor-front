import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import { useCompletePrescriptionRequest } from "@/hooks/Prescription-Request/usePrescriptionRequest";
import { FileText, Link, CheckCircle, User } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface CompletePrescriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PrescriptionRequest | null;
}

export default function CompletePrescriptionRequestModal({
  isOpen,
  onClose,
  request,
}: CompletePrescriptionRequestModalProps) {
  const [prescriptionUrl, setPrescriptionUrl] = useState("");
  const [prescriptionLink, setPrescriptionLink] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  const completeMutation = useCompletePrescriptionRequest();
  const { promiseToast, showError } = useToastContext();

  if (!request) return null;

  const handleSubmit = async () => {
    if (!prescriptionUrl && !prescriptionLink) {
      showError(
        "Campo requerido",
        "Debe proporcionar una URL de receta o un link externo"
      );
      return;
    }

    try {
      const promise = completeMutation.mutateAsync({
        id: String(request.id),
        data: {
          ...(prescriptionUrl && { prescriptionUrl }),
          ...(prescriptionLink && { prescriptionLink }),
          ...(doctorNotes && { doctorNotes }),
        },
      });

      await promiseToast(promise, {
        loading: {
          title: "Completando solicitud...",
          description: "Procesando la receta",
        },
        success: {
          title: "Solicitud completada",
          description: "La receta ha sido enviada al paciente",
        },
        error: (error: unknown) => ({
          title: "Error al completar",
          description:
            (error instanceof Error ? error.message : undefined) ||
            "No se pudo completar la solicitud",
        }),
      });

      handleClose();
    } catch {
      // Error handled by promiseToast
    }
  };

  const handleClose = () => {
    setPrescriptionUrl("");
    setPrescriptionLink("");
    setDoctorNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Completar Solicitud</h2>
              <p className="text-sm text-white/80 mt-1">
                Adjunte la receta para enviar al paciente
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Patient Info */}
          {request.patient && (
            <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Paciente
                  </p>
                  <p className="text-sm text-blue-700">
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

          {/* Prescription URL */}
          <div className="space-y-2">
            <Label
              htmlFor="prescriptionUrl"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Link className="h-4 w-4 text-green-600" />
              URL del Archivo de Receta
            </Label>
            <Input
              id="prescriptionUrl"
              type="url"
              value={prescriptionUrl}
              onChange={(e) => setPrescriptionUrl(e.target.value)}
              placeholder="https://storage.ejemplo.com/recetas/receta-12345.pdf"
              className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500">
              URL del archivo PDF de la receta subido al sistema
            </p>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-xs text-gray-500 font-medium">O</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Prescription Link */}
          <div className="space-y-2">
            <Label
              htmlFor="prescriptionLink"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Link className="h-4 w-4 text-green-600" />
              Link Externo de Receta
            </Label>
            <Input
              id="prescriptionLink"
              type="url"
              value={prescriptionLink}
              onChange={(e) => setPrescriptionLink(e.target.value)}
              placeholder="https://recetario.ejemplo.com/ver/12345"
              className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500">
              Link externo a un sistema de recetas electronicas
            </p>
          </div>

          {/* Doctor Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="doctorNotes"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-green-600" />
              Notas para el Paciente (opcional)
            </Label>
            <Textarea
              id="doctorNotes"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Indicaciones adicionales, posologia, duracion del tratamiento..."
              rows={3}
              className="resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              maxLength={500}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">
                {doctorNotes.length} / 500
              </span>
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
              disabled={completeMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                (!prescriptionUrl && !prescriptionLink) ||
                completeMutation.isPending
              }
              className="px-6 bg-green-600 hover:bg-green-700 text-white shadow-md min-w-[160px]"
            >
              {completeMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar y Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
