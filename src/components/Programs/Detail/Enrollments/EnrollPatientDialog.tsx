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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnrollmentMutations } from "@/hooks/Program/useEnrollmentMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface EnrollPatientDialogProps {
  programId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function EnrollPatientDialog({
  programId,
  isOpen,
  setIsOpen,
}: EnrollPatientDialogProps) {
  const { enrollPatientMutation } = useEnrollmentMutations(programId);
  const { promiseToast } = useToastContext();
  const [patientUserId, setPatientUserId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientUserId.trim()) return;

    try {
      const promise = enrollPatientMutation.mutateAsync({
        patientUserId: patientUserId.trim(),
      });
      await promiseToast(promise, {
        loading: {
          title: "Inscribiendo paciente...",
          description: "Procesando",
        },
        success: {
          title: "Paciente inscripto",
          description: "El paciente fue inscripto en el programa.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo inscribir al paciente.",
        }),
      });
      setPatientUserId("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error enrolling patient:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inscribir Paciente</DialogTitle>
          <DialogDescription>
            Ingresá el ID del paciente para inscribirlo en el programa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientUserId">ID del Paciente</Label>
            <Input
              id="patientUserId"
              placeholder="ID del paciente (UUID)"
              value={patientUserId}
              onChange={(e) => setPatientUserId(e.target.value)}
            />
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
                enrollPatientMutation.isPending || !patientUserId.trim()
              }
            >
              Inscribir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
