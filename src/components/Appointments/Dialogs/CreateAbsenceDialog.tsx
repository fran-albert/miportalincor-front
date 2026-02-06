import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarOff, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Absence, AbsenceLabels } from "@/types/Doctor-Absence/Doctor-Absence";
import { useDoctorAbsenceMutations } from "@/hooks/DoctorAbsence";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface CreateAbsenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: number;
  date: string;
  onSuccess?: () => void;
}

export const CreateAbsenceDialog = ({
  open,
  onOpenChange,
  doctorId,
  date,
  onSuccess,
}: CreateAbsenceDialogProps) => {
  const [absenceType, setAbsenceType] = useState<Absence>(Absence.OTHER);
  const { createAbsence, isCreating } = useDoctorAbsenceMutations();
  const { showSuccess, showError } = useToastContext();

  const formattedDate = date
    ? format(new Date(date + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", { locale: es })
    : "";

  const handleCreate = async () => {
    try {
      await createAbsence.mutateAsync({
        doctorId,
        startDate: date,
        endDate: date,
        type: absenceType,
      });
      showSuccess("Ausencia creada", `Se bloqueo el dia ${formattedDate}`);
      setAbsenceType(Absence.OTHER);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      showError("Error", "No se pudo crear la ausencia. Verifique que no exista una ausencia superpuesta.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5 text-orange-500" />
            Bloquear Dia Completo
          </DialogTitle>
          <DialogDescription>
            Se creara una ausencia para todo el dia. No se podran agendar turnos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="absenceType">Tipo de ausencia</Label>
            <Select
              value={absenceType}
              onValueChange={(value) => setAbsenceType(value as Absence)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AbsenceLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <CalendarOff className="h-4 w-4 mr-2" />
            {isCreating ? "Creando..." : "Bloquear Dia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAbsenceDialog;
