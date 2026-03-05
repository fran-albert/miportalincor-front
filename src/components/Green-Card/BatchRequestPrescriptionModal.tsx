import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  FileText,
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { GreenCard, GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useGreenCardMutations } from "@/hooks/Green-Card/useGreenCardMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface BatchRequestPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  greenCard: GreenCard;
  selectedItemIds: string[];
  onSuccess?: () => void;
}

interface GroupedItems {
  doctorUserId: string;
  doctorName: string;
  items: GreenCardItem[];
}

interface SkippedItem {
  item: GreenCardItem;
  reason: string;
}

export function BatchRequestPrescriptionModal({
  isOpen,
  onClose,
  greenCard,
  selectedItemIds,
  onSuccess,
}: BatchRequestPrescriptionModalProps) {
  const { batchRequestPrescriptionMutation } = useGreenCardMutations();
  const { showSuccess, showError } = useToastContext();

  // Separate selected items into sendable and skipped
  const selectedItems = greenCard.items.filter((item) =>
    selectedItemIds.includes(item.id)
  );

  const sendableItems: GreenCardItem[] = [];
  const skippedItems: SkippedItem[] = [];

  for (const item of selectedItems) {
    if (!item.isActive) {
      skippedItems.push({ item, reason: "Medicamento suspendido" });
    } else if (item.hasPendingPrescription) {
      skippedItems.push({
        item,
        reason: "Ya tiene una solicitud pendiente",
      });
    } else {
      sendableItems.push(item);
    }
  }

  // Group sendable items by doctor
  const groupedByDoctor: GroupedItems[] = [];
  const doctorMap = new Map<string, GreenCardItem[]>();

  for (const item of sendableItems) {
    const existing = doctorMap.get(item.doctorUserId) || [];
    existing.push(item);
    doctorMap.set(item.doctorUserId, existing);
  }

  for (const [doctorUserId, items] of doctorMap) {
    const doctor = items[0].doctor;
    const prefix = doctor?.gender === "Femenino" ? "Dra." : "Dr.";
    const doctorName = doctor
      ? `${prefix} ${doctor.firstName} ${doctor.lastName}`
      : "Medico";

    groupedByDoctor.push({ doctorUserId, doctorName, items });
  }

  const handleBatchRequest = async () => {
    try {
      // Only send the IDs of sendable items
      const sendableIds = sendableItems.map((item) => item.id);
      const result = await batchRequestPrescriptionMutation.mutateAsync({
        cardId: greenCard.id,
        itemIds: sendableIds,
      });

      const totalCreated = result.batches.reduce(
        (sum, b) => sum + b.itemCount,
        0
      );

      showSuccess(
        "Solicitudes enviadas correctamente",
        `Se enviaron ${totalCreated} solicitud(es) de receta.`
      );

      onSuccess?.();
      onClose();
    } catch {
      showError(
        "Error al solicitar recetas",
        "Por favor, intenta nuevamente mas tarde."
      );
    }
  };

  const isLoading = batchRequestPrescriptionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="h-5 w-5" />
            Solicitar Recetas en Lote
          </DialogTitle>
          <DialogDescription>
            {sendableItems.length > 0
              ? `Se enviaran ${sendableItems.length} solicitud(es) agrupadas por medico`
              : "No hay medicamentos disponibles para solicitar"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Sendable items grouped by doctor */}
          {groupedByDoctor.length > 0 && (
            <>
              {groupedByDoctor.map((group) => (
                <div
                  key={group.doctorUserId}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                >
                  <div className="font-medium text-blue-800 mb-2">
                    {group.doctorName}{" "}
                    <span className="text-sm font-normal text-blue-600">
                      ({group.items.length} medicamento
                      {group.items.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-900 font-medium flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                          {item.medicationName}
                        </span>
                        <span className="text-gray-600">
                          {item.dosage}
                          {item.quantity ? ` - Cant: ${item.quantity}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Skipped items with reasons */}
          {skippedItems.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                No se solicitaran ({skippedItems.length})
              </div>
              <div className="space-y-1.5">
                {skippedItems.map((skipped) => (
                  <div
                    key={skipped.item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-amber-900 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      {skipped.item.medicationName}
                    </span>
                    <span className="text-amber-600 text-xs">
                      {skipped.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friday Notice */}
          {sendableItems.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <CalendarDays className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Las recetas estaran disponibles para descargar el{" "}
                    <strong>proximo viernes a partir de las 14:00 hs</strong>
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}
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
            onClick={handleBatchRequest}
            disabled={isLoading || sendableItems.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Solicitar Recetas ({sendableItems.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
