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
import { useState } from "react";
import { useAttendanceMutations } from "@/hooks/Program/useAttendanceMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ProgramActivity } from "@/types/Program/ProgramActivity";

interface ManualAttendanceDialogProps {
  enrollmentId: string;
  patientUserId: string;
  activities: ProgramActivity[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ManualAttendanceDialog({
  enrollmentId,
  patientUserId,
  activities,
  isOpen,
  setIsOpen,
}: ManualAttendanceDialogProps) {
  const { registerManualMutation } = useAttendanceMutations();
  const { promiseToast } = useToastContext();
  const [selectedActivityId, setSelectedActivityId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId) return;

    try {
      const promise = registerManualMutation.mutateAsync({
        enrollmentId,
        activityId: selectedActivityId,
        patientUserId,
      });
      await promiseToast(promise, {
        loading: {
          title: "Registrando asistencia...",
          description: "Procesando",
        },
        success: {
          title: "Asistencia registrada",
          description: "La asistencia fue registrada correctamente.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo registrar la asistencia.",
        }),
      });
      setSelectedActivityId("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error registering attendance:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Asistencia Manual</DialogTitle>
          <DialogDescription>
            Seleccioná la actividad para registrar asistencia.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Actividad</Label>
            <Select
              value={selectedActivityId}
              onValueChange={setSelectedActivityId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar actividad" />
              </SelectTrigger>
              <SelectContent>
                {activities
                  .filter((a) => a.isActive)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                registerManualMutation.isPending || !selectedActivityId
              }
            >
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
