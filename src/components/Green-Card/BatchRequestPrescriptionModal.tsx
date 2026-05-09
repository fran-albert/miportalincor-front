import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { GreenCard, GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useGreenCardMutations } from "@/hooks/Green-Card/useGreenCardMutation";
import { useAvailableDoctorsForPrescriptions } from "@/hooks/Doctor-Settings/useDoctorSettings";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface BatchRequestPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  greenCard: GreenCard;
  selectedItemIds: string[];
  onSuccess?: () => void;
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
  const { data: availableDoctors, isLoading: isLoadingDoctors } =
    useAvailableDoctorsForPrescriptions(isOpen);

  const [selectedDoctorUserId, setSelectedDoctorUserId] = useState<string>("");
  const [patientMessage, setPatientMessage] = useState<string>("");
  const [isDoctorAutoSelected, setIsDoctorAutoSelected] = useState(false);

  const { sendableItems, skippedItems } = useMemo(() => {
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

    return { sendableItems, skippedItems };
  }, [greenCard.items, selectedItemIds]);

  const findMatchingDoctorUserId = useCallback((item: GreenCardItem) => {
    if (!availableDoctors) return null;

    const foundDoctor = availableDoctors.find(
      (doctor) =>
        doctor.userId === item.doctorUserId || doctor.id === item.doctor?.id
    );

    return foundDoctor?.userId ?? null;
  }, [availableDoctors]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctorUserId("");
      setPatientMessage("");
      setIsDoctorAutoSelected(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !availableDoctors || selectedDoctorUserId) {
      return;
    }

    const uniqueDoctorUserIds = Array.from(
      new Set(
        sendableItems
          .map((item) => findMatchingDoctorUserId(item))
          .filter((doctorUserId): doctorUserId is string => Boolean(doctorUserId))
      )
    );

    if (uniqueDoctorUserIds.length !== 1) {
      return;
    }

    setSelectedDoctorUserId(uniqueDoctorUserIds[0]);
    setIsDoctorAutoSelected(true);
  }, [
    isOpen,
    availableDoctors,
    findMatchingDoctorUserId,
    sendableItems,
    selectedDoctorUserId,
  ]);

  const selectedDoctor = availableDoctors?.find(
    (doctor) => doctor.userId === selectedDoctorUserId
  );

  const handleBatchRequest = async () => {
    try {
      const sendableIds = sendableItems.map((item) => item.id);
      const result = await batchRequestPrescriptionMutation.mutateAsync({
        cardId: greenCard.id,
        itemIds: sendableIds,
        doctorUserId: selectedDoctorUserId || undefined,
        ...(patientMessage.trim() && { patientMessage: patientMessage.trim() }),
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
          <DialogTitle className="flex items-center gap-2 text-blue-700 text-xl">
            <FileText className="h-5 w-5" />
            Solicitar Recetas en Lote
          </DialogTitle>
          <DialogDescription className="text-base">
            {sendableItems.length > 0
              ? `${sendableItems.length} receta(s) listas para enviar al médico que elijas.`
              : "No hay medicamentos disponibles para solicitar"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Doctor Selector */}
          {sendableItems.length > 0 && (
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/70 p-4">
              <div className="space-y-1">
                <Label className="text-base font-semibold text-slate-900">
                  Médico que recibe las solicitudes
                </Label>
                <p className="text-sm leading-5 text-slate-600">
                  Este médico recibirá todas las recetas seleccionadas.
                </p>
              </div>
              {isLoadingDoctors ? (
                <div className="flex items-center gap-2 text-base text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando médicos...
                </div>
              ) : !availableDoctors || availableDoctors.length === 0 ? (
                <div className="text-base font-medium text-red-600">
                  No hay médicos disponibles para recetas
                </div>
              ) : (
                <>
                  <Select
                    value={selectedDoctorUserId}
                    onValueChange={(value) => {
                      setSelectedDoctorUserId(value);
                      setIsDoctorAutoSelected(false);
                    }}
                  >
                    <SelectTrigger className="h-12 w-full bg-white text-base">
                      <SelectValue placeholder="Elegí el médico que debe hacer las recetas" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map((doctor) => {
                        const prefix =
                          doctor.gender === "Femenino" ? "Dra." : "Dr.";
                        return (
                          <SelectItem key={doctor.userId} value={doctor.userId}>
                            {prefix} {doctor.firstName} {doctor.lastName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedDoctor && isDoctorAutoSelected && (
                    <div className="flex gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm leading-5 text-green-800">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Preseleccionamos el médico asociado a los medicamentos.
                        Podés cambiarlo si corresponde.
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Sendable items list */}
          {sendableItems.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="font-medium text-blue-800 mb-2">
                Medicamentos a solicitar{" "}
                <span className="text-sm font-normal text-blue-600">
                  ({sendableItems.length})
                </span>
              </div>
              <div className="space-y-1">
                {sendableItems.map((item) => (
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
          )}

          {sendableItems.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <Label
                htmlFor="green-card-batch-prescription-message"
                className="text-sm font-semibold text-slate-700"
              >
                Mensaje opcional
              </Label>
              <Textarea
                id="green-card-batch-prescription-message"
                value={patientMessage}
                onChange={(event) => setPatientMessage(event.target.value)}
                placeholder="Nota para el médico."
                maxLength={500}
                className="min-h-[96px] resize-none bg-white"
              />
              <p className="text-xs text-slate-500">Opcional.</p>
            </div>
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

          {sendableItems.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800">
              Si el médico aprueba la solicitud, las recetas estarán disponibles
              el próximo viernes a partir de las 14:00 hs.
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-12 text-base"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleBatchRequest}
            disabled={isLoading || sendableItems.length === 0 || !selectedDoctorUserId || isLoadingDoctors}
            className="h-12 bg-blue-600 px-5 text-base font-semibold hover:bg-blue-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar solicitud de recetas ({sendableItems.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
