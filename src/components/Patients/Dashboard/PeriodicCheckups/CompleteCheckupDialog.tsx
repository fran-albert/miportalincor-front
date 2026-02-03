import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteCheckup } from "@/hooks/Periodic-Checkup";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Loader2, CalendarCheck } from "lucide-react";
import { format, addMonths } from "date-fns";

interface CompleteCheckupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: PatientCheckupSchedule;
  patientId: number;
  patientName?: string;
}

export function CompleteCheckupDialog({
  open,
  onOpenChange,
  schedule,
  patientId,
  patientName,
}: CompleteCheckupDialogProps) {
  const { mutateAsync: completeCheckup, isPending } = useCompleteCheckup(patientId);
  const { showSuccess, showError } = useToastContext();

  const today = format(new Date(), "yyyy-MM-dd");
  const [completedDate, setCompletedDate] = useState(today);
  const [notes, setNotes] = useState(schedule.notes || "");

  // Default next due date: use the patient's frequency as suggestion
  const frequencyMonths = schedule.frequencyMonths || 12;
  const defaultNextDueDate = format(addMonths(new Date(), frequencyMonths), "yyyy-MM-dd");
  const [nextDueDate, setNextDueDate] = useState(defaultNextDueDate);

  const handleSubmit = async () => {
    if (!completedDate) {
      showError("Seleccioná la fecha de realización");
      return;
    }

    if (!nextDueDate) {
      showError("Seleccioná la fecha del próximo chequeo");
      return;
    }

    try {
      await completeCheckup({
        id: schedule.id,
        dto: {
          completedDate,
          nextDueDate,
          notes: notes || undefined,
        },
      });
      showSuccess("Chequeo marcado como completado");
      onOpenChange(false);
    } catch {
      showError("Error al completar el chequeo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-green-600" />
            Completar Chequeo
          </DialogTitle>
          <DialogDescription>
            Registrar la realización del chequeo de{" "}
            <strong>{schedule.checkupType?.name}</strong>
            {patientName && <> para <strong>{patientName}</strong></>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Fecha de Realización</Label>
            <Input
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              max={today}
            />
          </div>

          <div className="space-y-2">
            <Label>Próximo Chequeo *</Label>
            <Input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              min={today}
            />
            <p className="text-xs text-gray-500">
              Elegí manualmente cuándo debe realizarse el próximo chequeo
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              placeholder="Agregar observaciones del chequeo..."
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
            disabled={isPending || !completedDate || !nextDueDate}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Marcar como Completado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
