import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { useCreateCurrentMedication } from "@/hooks/Current-Medication/useCurrentMedication";
import { CreateCurrentMedicationDto } from "@/types/Current-Medication/Current-Medication";
import { Pill, Calendar, User, FileText, Plus } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

type UserData = Patient | Doctor;

interface CreateCurrentMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  userType: "patient" | "doctor";
  doctor?: Doctor;
}

export default function CreateCurrentMedicationModal({
  isOpen,
  onClose,
  userData,
  userType,
  doctor,
}: CreateCurrentMedicationModalProps) {
  const [observations, setObservations] = useState("");
  const createMutation = useCreateCurrentMedication();
  const { promiseToast, showError } = useToastContext();

  const handleAddMedication = async () => {
    if (!observations.trim()) {
      showError("Campo requerido", "Las observaciones son obligatorias");
      return;
    }

    // idDoctor siempre es el doctor actual (logueado)
    const doctorId = doctor?.userId;

    // idUser siempre es el paciente
    // Si userType === "patient", userData es el paciente
    // Si userType === "doctor", userData es el doctor pero NO se pueden crear medicaciones para doctores
    if (userType === "doctor") {
      showError(
        "Operación no permitida",
        "No se pueden crear medicaciones para doctores"
      );
      return;
    }

    const patientId = userData.userId; // userData es el paciente

    if (!doctorId) {
      showError(
        "Error de validación",
        "No se pudo obtener la información del médico"
      );
      return;
    }

    try {
      // Crear la nueva medicación
      const createData: CreateCurrentMedicationDto = {
        idUser: patientId.toString(),
        idDoctor: doctorId.toString(),
        startDate: new Date().toISOString(),
        observations: observations.trim(),
      };

      const promise = createMutation.mutateAsync(createData);

      await promiseToast(promise, {
        loading: {
          title: "Guardando medicación...",
          description: "Procesando la información médica",
        },
        success: {
          title: "¡Medicación agregada!",
          description: "La medicación se ha registrado correctamente",
        },
        error: (error: unknown) => ({
          title: "Error al guardar",
          description:
            (error instanceof Error ? error.message : undefined) ||
            "No se pudo registrar la medicación. Intenta nuevamente.",
        }),
      });

      handleClose();
    } catch (error) {
      // Error already handled by promiseToast
    }
  };

  const handleClose = () => {
    setObservations("");
    onClose();
  };

  const currentDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Agregar Medicación Actual</h2>
              <p className="text-sm text-white/80 mt-1">
                Complete los campos para registrar la medicación del paciente
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Card - Fecha y Doctor */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">
                    Fecha de Inicio
                  </p>
                  <p className="text-xs text-blue-700 mt-1 capitalize">
                    {currentDate}
                  </p>
                </div>
              </div>

              {doctor && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">
                      Médico Responsable
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label
              htmlFor="observations"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-greenPrimary" />
              Observaciones de Medicación *
            </Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Describe el medicamento, dosis, frecuencia, indicaciones especiales, reacciones adversas, etc..."
              rows={8}
              className="resize-none focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
              maxLength={1000}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Incluye nombre, dosis, frecuencia, duración del tratamiento,
                etc.
              </p>
              <span className="text-gray-400">
                {observations?.length || 0} / 1000
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 hover:bg-gray-50"
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddMedication}
              disabled={!observations.trim() || createMutation.isPending}
              className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px]"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
