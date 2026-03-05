import { useState, useEffect } from "react";
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
import { Loader2, FileText, User, CalendarDays, Clock } from "lucide-react";
import { GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useGreenCardMutations } from "@/hooks/Green-Card/useGreenCardMutation";
import { useAvailableDoctorsForPrescriptions } from "@/hooks/Doctor-Settings/useDoctorSettings";
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
  const { data: availableDoctors, isLoading: isLoadingDoctors } =
    useAvailableDoctorsForPrescriptions(isOpen);

  const [selectedDoctorUserId, setSelectedDoctorUserId] = useState<string>("");

  // Pre-select the doctor who added the medication only on first open
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctorUserId("");
      return;
    }
    if (availableDoctors && item.doctorUserId && !selectedDoctorUserId) {
      const found = availableDoctors.find(
        (d) => d.userId === item.doctorUserId
      );
      if (found) {
        setSelectedDoctorUserId(found.userId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, availableDoctors, item.doctorUserId]);

  // Get doctor display name for the selected doctor
  const getSelectedDoctorName = () => {
    if (!availableDoctors || !selectedDoctorUserId) return "el médico";
    const doctor = availableDoctors.find(
      (d) => d.userId === selectedDoctorUserId
    );
    if (!doctor) return "el médico";
    const prefix = doctor.gender === "Femenino" ? "Dra." : "Dr.";
    return `${prefix} ${doctor.firstName} ${doctor.lastName}`;
  };

  const handleRequestPrescription = async () => {
    try {
      await requestPrescriptionMutation.mutateAsync({
        cardId: greenCardId,
        itemId: item.id,
        doctorUserId: selectedDoctorUserId || undefined,
      });
      showSuccess(
        "Solicitud enviada correctamente",
        `Tu solicitud fue enviada a ${getSelectedDoctorName()}. Estará lista el próximo viernes a las 14hs.`
      );
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "";

      if (
        errorMessage.includes("pending") ||
        errorMessage.includes("in_progress")
      ) {
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
            Seleccioná el médico al que querés enviar la solicitud
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
                    <div className="text-sm text-gray-800">
                      {item.quantity}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Selector */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                Médico que recibe la solicitud
              </div>
              {isLoadingDoctors ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando médicos...
                </div>
              ) : !availableDoctors || availableDoctors.length === 0 ? (
                <div className="text-sm text-red-600">
                  No hay médicos disponibles para recetas
                </div>
              ) : (
                <>
                  <Select
                    value={selectedDoctorUserId}
                    onValueChange={setSelectedDoctorUserId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccioná un médico" />
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
                  {selectedDoctorUserId && (() => {
                    const selected = availableDoctors.find(
                      (d) => d.userId === selectedDoctorUserId
                    );
                    if (selected?.specialities && selected.specialities.length > 0) {
                      return (
                        <div className="text-xs text-gray-500 mt-1">
                          {selected.specialities[0].name}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
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
            disabled={isLoading || !selectedDoctorUserId || isLoadingDoctors}
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
