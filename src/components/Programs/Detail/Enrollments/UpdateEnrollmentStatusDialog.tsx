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
import { useEnrollmentMutations } from "@/hooks/Program/useEnrollmentMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  EnrollmentStatus,
  EnrollmentStatusLabels,
  ProgramEnrollment,
} from "@/types/Program/ProgramEnrollment";

interface UpdateEnrollmentStatusDialogProps {
  programId: string;
  enrollment: ProgramEnrollment;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function UpdateEnrollmentStatusDialog({
  programId,
  enrollment,
  isOpen,
  setIsOpen,
}: UpdateEnrollmentStatusDialogProps) {
  const { updateEnrollmentStatusMutation } =
    useEnrollmentMutations(programId);
  const { promiseToast } = useToastContext();
  const [status, setStatus] = useState<EnrollmentStatus>(enrollment.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promise = updateEnrollmentStatusMutation.mutateAsync({
        enrollmentId: enrollment.id,
        status,
      });
      await promiseToast(promise, {
        loading: {
          title: "Actualizando estado...",
          description: "Procesando",
        },
        success: {
          title: "Estado actualizado",
          description: "El estado de la inscripción fue actualizado.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo actualizar el estado.",
        }),
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado de Inscripción</DialogTitle>
          <DialogDescription>
            Seleccioná el nuevo estado para esta inscripción.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as EnrollmentStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EnrollmentStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
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
              disabled={updateEnrollmentStatusMutation.isPending}
            >
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
