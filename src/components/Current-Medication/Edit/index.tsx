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
import {
  useSuspendCurrentMedication,
  useUpdateCurrentMedication,
} from "@/hooks/Current-Medication/useCurrentMedication";
import {
  SuspendCurrentMedicationDto,
  UpdateCurrentMedicationDto,
} from "@/types/Current-Medication/Current-Medication";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { AlertCircle, Ban, Calendar, Edit, FileText, Save } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { formatDateTimeArgentina } from "@/common/helpers/helpers";

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
  const [observations, setObservations] = useState(
    medication.observations || ""
  );
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const updateMutation = useUpdateCurrentMedication();
  const { promiseToast, showError } = useToastContext();
  const suspendMutation = useSuspendCurrentMedication();

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
          description: "Procesando la información médica",
        },
        success: {
          title: "¡Medicación actualizada!",
          description: "Los cambios se han guardado correctamente",
        },
        error: (error) => ({
          title: "Error al actualizar",
          description:
            error?.message ||
            "No se pudo actualizar la medicación. Intenta nuevamente.",
        }),
      });

      handleClose();
    } catch (error) {
      // Error already handled by promiseToast
    }
  };

  const handleClose = () => {
    setObservations(medication.observations || "");
    setShowSuspendConfirm(false);
    onClose();
  };

  // Check if user can edit this medication
  const canEdit = userType === "doctor";

  const handleSuspendMedication = async () => {
    try {
      const suspendData: SuspendCurrentMedicationDto = {
        suspensionDate: new Date().toISOString(),
      };

      const promise = suspendMutation.mutateAsync({
        id: String(medication.id),
        data: suspendData,
      });

      await promiseToast(promise, {
        loading: {
          title: "Suspendiendo medicación...",
          description: "Procesando la solicitud",
        },
        success: {
          title: "¡Medicación suspendida!",
          description: "La medicación se ha movido al historial",
        },
        error: (error) => ({
          title: "Error al suspender",
          description:
            error?.message ||
            "No se pudo suspender la medicación. Intenta nuevamente.",
        }),
      });

      handleClose();
    } catch (error) {
      // Error already handled by promiseToast
    }
  };

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
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Actualizar Medicación</h2>
              <p className="text-sm text-white/80 mt-1">
                Modifica la información de la medicación actual
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Card - Medication Info */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Fecha de Inicio
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {formatDateTimeArgentina(medication.startDate)}
                </p>
              </div>
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

          {/* Suspend Confirmation */}
          {showSuspendConfirm && (
            <div className="bg-amber-50 border-l-4 border-l-amber-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    ¿Confirmar suspensión de medicación?
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    La medicación se moverá al historial y ya no estará activa
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSuspendConfirm(false)}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSuspendMedication}
                      disabled={suspendMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      {suspendMutation.isPending ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          Suspendiendo...
                        </>
                      ) : (
                        "Confirmar Suspensión"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSuspendConfirm(true)}
              disabled={
                updateMutation.isPending ||
                suspendMutation.isPending ||
                showSuspendConfirm
              }
              className="px-4 text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspender
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="px-6 hover:bg-gray-50"
                disabled={updateMutation.isPending || suspendMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateMedication}
                disabled={
                  !observations.trim() ||
                  updateMutation.isPending ||
                  suspendMutation.isPending
                }
                className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px]"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
