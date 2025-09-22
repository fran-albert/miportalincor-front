import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Calendar, User } from "lucide-react";
import { EvolutionTableRow } from "../Table/columns";
import { formatEvolutionDateTime, getDeleteTimeRemaining } from "@/common/helpers/evolutionHelpers";
import { formatDoctorInfo } from "@/common/helpers/helpers";

interface DeleteEvolutionDialogProps {
  evolution: EvolutionTableRow | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (evolution: EvolutionTableRow) => Promise<void>;
  isDeleting?: boolean;
}

export default function DeleteEvolutionDialog({
  evolution,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteEvolutionDialogProps) {
  if (!evolution) return null;

  const doctorInfo = formatDoctorInfo(evolution.doctor);
  const dateTime = formatEvolutionDateTime(evolution.fechaConsulta);
  const timeRemaining = getDeleteTimeRemaining(evolution.fechaCreacion);

  const handleConfirm = async () => {
    await onConfirm(evolution);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La evolución será eliminada permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la evolución */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{dateTime.date} - {dateTime.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {doctorInfo.fullNameWithPrimarySpeciality}
                </span>
              </div>

              {evolution.motivoConsulta && (
                <div>
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Motivo de Consulta:
                  </span>
                  <p className="text-sm text-gray-800 mt-1">
                    {evolution.motivoConsulta.length > 100
                      ? `${evolution.motivoConsulta.substring(0, 100)}...`
                      : evolution.motivoConsulta}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información sobre el tiempo límite */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Ventana de eliminación</p>
                <p className="text-orange-700 mt-1">
                  {timeRemaining}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="min-w-[100px]"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}