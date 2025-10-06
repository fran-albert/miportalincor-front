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
import { useUpdateCurrentMedication } from "@/hooks/Current-Medication/useCurrentMedication";
import {
  UpdateCurrentMedicationDto,
} from "@/types/Current-Medication/Current-Medication";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { Edit } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface EditCurrentMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: MedicacionActual;
  userType: "patient" | "doctor";
}

export default function EditCurrentMedicationModal({
  isOpen,
  onClose,
  medication,
  userType,
}: EditCurrentMedicationModalProps) {
  const [observations, setObservations] = useState(medication.observations || "");
  const updateMutation = useUpdateCurrentMedication();
  const { promiseToast, showError } = useToastContext();

  const handleUpdateMedication = async () => {
    if (!observations.trim()) {
      showError("Campo requerido", "Las observaciones son obligatorias");
      return;
    }

    try {
      const updateData: UpdateCurrentMedicationDto = {
        observations: observations.trim(),
      };

      const promise = updateMutation.mutateAsync({
        id: String(medication.id),
        data: updateData,
      });

      await promiseToast(promise, {
        loading: {
          title: "Actualizando medicación...",
          description: "Procesando la información médica"
        },
        success: {
          title: "¡Medicación actualizada!",
          description: "Los cambios se han guardado correctamente"
        },
        error: (error) => ({
          title: "Error al actualizar",
          description: error?.message || "No se pudo actualizar la medicación. Intenta nuevamente."
        })
      });

      handleClose();
    } catch (error) {
      // Error already handled by promiseToast
    }
  };

  const handleClose = () => {
    setObservations(medication.observations || "");
    onClose();
  };

  // Check if user can edit this medication
  const canEdit = userType === "doctor";

  if (!canEdit) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-red-600" />
              Sin Permisos
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600">
              No tienes permisos para editar esta medicación.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Edit className="h-5 w-5 text-purple-600" />
            Actualizar Medicación Actual
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
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
            onClick={handleUpdateMedication}
            disabled={updateMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 px-6"
          >
            {updateMutation.isPending ? "Guardando..." : "Actualizar Medicación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
