import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Stethoscope, Tag, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ConsultationTypesMultiSelect } from "../Select/ConsultationTypesMultiSelect";
import { formatTimeAR } from "@/common/helpers/timezone";

export interface EditConsultationTypeTarget {
  id: number;
  doctorId?: number | null;
  date: string;
  hour: string;
  consultationTypeIds: number[];
  doctor?: { firstName: string; lastName: string } | null;
  patient?: { firstName: string; lastName: string } | null;
}

interface EditConsultationTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: EditConsultationTypeTarget | null;
  onSave: (id: number, consultationTypeIds: number[]) => Promise<void>;
  isSaving: boolean;
}

const haveSameIds = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((id, index) => id === sortedB[index]);
};

export function EditConsultationTypeDialog({
  open,
  onOpenChange,
  appointment,
  onSave,
  isSaving,
}: EditConsultationTypeDialogProps) {
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);

  useEffect(() => {
    if (open && appointment) {
      setSelectedTypeIds(appointment.consultationTypeIds);
    }
  }, [open, appointment]);

  const hasChanges = useMemo(
    () =>
      appointment !== null &&
      !haveSameIds(selectedTypeIds, appointment.consultationTypeIds),
    [appointment, selectedTypeIds]
  );

  const handleSave = async () => {
    if (!appointment || !hasChanges) return;
    await onSave(appointment.id, selectedTypeIds);
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Editar tipo de turno
          </DialogTitle>
          <DialogDescription>
            Cambiá el tipo de consulta de este turno sin modificar la fecha ni
            el horario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
            {appointment.doctor && (
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span>
                  Dr/a. {appointment.doctor.firstName}{" "}
                  {appointment.doctor.lastName}
                </span>
              </div>
            )}
            {appointment.patient && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(
                  new Date(appointment.date + "T12:00:00"),
                  "EEEE d 'de' MMMM, yyyy",
                  { locale: es }
                )}{" "}
                - {formatTimeAR(appointment.hour)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Tipo de turno</Label>
            <ConsultationTypesMultiSelect
              value={selectedTypeIds}
              onValueChange={setSelectedTypeIds}
              doctorId={appointment.doctorId ?? undefined}
              placeholder="Seleccionar tipos de turno"
            />
            <p className="text-xs text-muted-foreground">
              Si el nuevo tipo dura más que el actual, se verifica que el
              horario siga disponible.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
