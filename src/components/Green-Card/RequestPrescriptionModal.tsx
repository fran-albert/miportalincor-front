import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, User, CalendarDays, Clock } from "lucide-react";
import { GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useGreenCardMutations } from "@/hooks/Green-Card/useGreenCardMutation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface RequestPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  greenCardId: string;
  item: GreenCardItem;
}

export function RequestPrescriptionModal({
  isOpen,
  onClose,
  greenCardId,
  item,
}: RequestPrescriptionModalProps) {
  const { requestPrescriptionMutation } = useGreenCardMutations();
  const { showSuccess, showError } = useToastContext();

  // Get doctor display name
  const getDoctorName = () => {
    if (!item.doctor) return "el médico";
    const prefix = item.doctor.gender === "Femenino" ? "Dra." : "Dr.";
    return `${prefix} ${item.doctor.firstName} ${item.doctor.lastName}`;
  };

  const handleRequestPrescription = async () => {
    try {
      await requestPrescriptionMutation.mutateAsync({
        cardId: greenCardId,
        itemId: item.id,
      });
      showSuccess(
        "Solicitud enviada correctamente",
        `Tu solicitud fue enviada a ${getDoctorName()}. Estará lista el próximo viernes a las 14hs.`
      );
      onClose();
    } catch (error: unknown) {
      // Handle specific error messages from backend
      const errorMessage = error instanceof Error ? error.message : "";

      if (errorMessage.includes("pending") || errorMessage.includes("in_progress")) {
        showError(
          "Ya tenés una solicitud pendiente",
          "Esperá a que se procese tu solicitud anterior para este medicamento."
        );
      } else {
        showError(
          "Error al solicitar la receta",
          "Por favor, intentá nuevamente más tarde."
        );
      }
    }
  };

  const isLoading = requestPrescriptionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="h-5 w-5" />
            Solicitar Receta
          </DialogTitle>
          <DialogDescription>
            Se enviará la solicitud al médico que indicó este medicamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Medication Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Medicamento
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {item.medicationName}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Dosis
                  </div>
                  <div className="text-sm text-gray-800">{item.dosage}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Horario
                  </div>
                  <div className="text-sm text-gray-800">{item.schedule}</div>
                </div>
                {item.quantity && (
                  <div>
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      Cantidad
                    </div>
                    <div className="text-sm text-gray-800">{item.quantity}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Médico que recibe la solicitud</div>
              <div className="font-medium text-gray-900">{getDoctorName()}</div>
              {item.doctor?.specialities && item.doctor.specialities.length > 0 && (
                <div className="text-xs text-gray-500">{item.doctor.specialities[0]}</div>
              )}
            </div>
          </div>

          {/* Friday Notice */}
          <Alert className="border-amber-200 bg-amber-50">
            <CalendarDays className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  La receta estará disponible para descargar el{" "}
                  <strong>próximo viernes a partir de las 14:00 hs</strong>
                </span>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRequestPrescription}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
