import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { useCreateCurrentMedication } from "@/hooks/Current-Medication/useCurrentMedication";
import { CreateCurrentMedicationDto } from "@/types/Current-Medication/Current-Medication";
import { Pill } from "lucide-react";
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
      showError("Operación no permitida", "No se pueden crear medicaciones para doctores");
      return;
    }

    const patientId = userData.userId; // userData es el paciente

    if (!doctorId) {
      showError("Error de validación", "No se pudo obtener la información del médico");
      return;
    }

    const createData: CreateCurrentMedicationDto = {
      idUser: patientId.toString(),
      idDoctor: doctorId.toString(),
      startDate: new Date().toISOString(),
      observations: observations.trim(),
    };

    try {
      const promise = createMutation.mutateAsync(createData);

      await promiseToast(promise, {
        loading: {
          title: "Guardando medicación...",
          description: "Procesando la información médica"
        },
        success: {
          title: "¡Medicación agregada!",
          description: "La medicación se ha registrado correctamente en el historial"
        },
        error: (error) => ({
          title: "Error al guardar",
          description: error?.message || "No se pudo registrar la medicación. Intenta nuevamente."
        })
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Pill className="h-5 w-5 text-purple-600" />
            Agregar Nueva Medicación
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Información de fecha automática */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-700 font-medium">
              📅 Fecha de Inicio:{" "}
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Se registrará automáticamente la fecha de hoy
            </p>
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="observations"
              className="text-sm font-medium text-gray-700"
            >
              Observaciones
            </Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Describe el medicamento, dosis, frecuencia, indicaciones especiales, reacciones adversas, etc..."
              rows={6}
              className="resize-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500">
              Incluye toda la información relevante sobre la medicación: nombre, dosis, frecuencia, duración del tratamiento, etc.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="px-6">
            Cancelar
          </Button>
          <Button
            onClick={handleAddMedication}
            disabled={createMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 px-6"
          >
            {createMutation.isPending ? "Guardando..." : "Agregar Medicación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}