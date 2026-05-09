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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, FileText } from "lucide-react";
import { GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useGreenCardMutations } from "@/hooks/Green-Card/useGreenCardMutation";
import { useAvailableDoctorsForPrescriptions } from "@/hooks/Doctor-Settings/useDoctorSettings";
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
  const [patientMessage, setPatientMessage] = useState("");
  const [isDoctorAutoSelected, setIsDoctorAutoSelected] = useState(false);

  const findMatchingDoctor = () => {
    if (!availableDoctors) return null;

    return availableDoctors.find(
      (doctor) =>
        doctor.userId === item.doctorUserId || doctor.id === item.doctor?.id
    );
  };

  // Pre-select the doctor who added the medication only on first open
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctorUserId("");
      setPatientMessage("");
      setIsDoctorAutoSelected(false);
      return;
    }

    if (!selectedDoctorUserId) {
      const foundDoctor = findMatchingDoctor();
      if (foundDoctor) {
        setSelectedDoctorUserId(foundDoctor.userId);
        setIsDoctorAutoSelected(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, availableDoctors, item.doctorUserId, item.doctor?.id]);

  const selectedDoctor = availableDoctors?.find(
    (doctor) => doctor.userId === selectedDoctorUserId
  );

  // Get doctor display name for the selected doctor
  const getSelectedDoctorName = () => {
    if (!selectedDoctor) return "el médico";
    const prefix = selectedDoctor.gender === "Femenino" ? "Dra." : "Dr.";
    return `${prefix} ${selectedDoctor.firstName} ${selectedDoctor.lastName}`;
  };

  const handleRequestPrescription = async () => {
    try {
      await requestPrescriptionMutation.mutateAsync({
        cardId: greenCardId,
        itemId: item.id,
        doctorUserId: selectedDoctorUserId || undefined,
        ...(patientMessage.trim() && { patientMessage: patientMessage.trim() }),
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
          <DialogTitle className="flex items-center gap-2 text-blue-700 text-xl">
            <FileText className="h-5 w-5" />
            Solicitar Receta
          </DialogTitle>
          <DialogDescription className="text-base">
            Revisá el medicamento, elegí el médico que hará la receta y enviá
            la solicitud.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Medication Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="space-y-3">
              <div>
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
          <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/70 p-4">
            <div className="space-y-1">
              <Label className="text-base font-semibold text-slate-900">
                Médico que recibe la solicitud
              </Label>
              <p className="text-sm leading-5 text-slate-600">
                Esta receta se enviará al médico que selecciones acá.
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
                    <SelectValue placeholder="Elegí el médico que debe hacer la receta" />
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
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Preseleccionamos el médico asociado a este medicamento.
                      Podés cambiarlo si corresponde.
                    </span>
                  </div>
                )}
                {selectedDoctor?.specialities &&
                  selectedDoctor.specialities.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Especialidad: {selectedDoctor.specialities[0].name}
                    </div>
                  )}
              </>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <Label
              htmlFor="green-card-prescription-message"
              className="text-sm font-semibold text-slate-700"
            >
              Mensaje opcional
            </Label>
            <Textarea
              id="green-card-prescription-message"
              value={patientMessage}
              onChange={(event) => setPatientMessage(event.target.value)}
              placeholder="Nota para el médico."
              maxLength={500}
              className="min-h-[96px] resize-none bg-white"
            />
            <p className="text-xs text-slate-500">Opcional.</p>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800">
            Si el médico aprueba la solicitud, la receta estará disponible el
            próximo viernes a partir de las 14:00 hs.
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2 sm:items-center">
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
            onClick={handleRequestPrescription}
            disabled={isLoading || !selectedDoctorUserId || isLoadingDoctors}
            className="h-12 bg-blue-600 px-5 text-base font-semibold hover:bg-blue-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
