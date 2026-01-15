import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveCheckupTypes } from "@/hooks/Periodic-Checkup";
import { useAssignCheckupToPatient } from "@/hooks/Periodic-Checkup";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Loader2 } from "lucide-react";

interface AssignCheckupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  existingSchedules: PatientCheckupSchedule[];
}

export function AssignCheckupDialog({
  open,
  onOpenChange,
  patientId,
  existingSchedules,
}: AssignCheckupDialogProps) {
  const { checkupTypes, isLoading: isLoadingTypes } = useActiveCheckupTypes();
  const { mutateAsync: assignCheckup, isPending } = useAssignCheckupToPatient();
  const { showSuccess, showError } = useToastContext();

  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Filter out already assigned checkup types
  const existingTypeIds = existingSchedules.map((s) => s.checkupTypeId);
  const availableTypes = checkupTypes.filter(
    (t) => !existingTypeIds.includes(t.id)
  );

  const handleSubmit = async () => {
    if (!selectedTypeId) {
      showError("Selecciona un tipo de chequeo");
      return;
    }

    try {
      await assignCheckup({
        patientId: Number(patientId),
        checkupTypeId: Number(selectedTypeId),
        notes: notes || undefined,
      });
      showSuccess("Chequeo asignado correctamente");
      onOpenChange(false);
      setSelectedTypeId("");
      setNotes("");
    } catch (error) {
      showError("Error al asignar el chequeo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Chequeo Periódico</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Chequeo</Label>
            {isLoadingTypes ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando tipos...
              </div>
            ) : availableTypes.length === 0 ? (
              <p className="text-sm text-gray-500">
                El paciente ya tiene todos los tipos de chequeo asignados
              </p>
            ) : (
              <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de chequeo" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      <div className="flex flex-col">
                        <span>{type.name}</span>
                        <span className="text-xs text-gray-500">
                          {type.specialityName} • Cada {type.frequencyMonths} meses
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              placeholder="Agregar notas o indicaciones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !selectedTypeId || availableTypes.length === 0}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
