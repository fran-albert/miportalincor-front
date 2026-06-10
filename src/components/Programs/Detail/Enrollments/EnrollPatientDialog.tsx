import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PatientSelect } from "@/components/Appointments/Select/PatientSelect";
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
  const navigate = useNavigate();
  const { enrollPatientMutation } = useEnrollmentMutations(programId);
  const { promiseToast } = useToastContext();
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
  const [enrolledId, setEnrolledId] = useState<string | null>(null);

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedPatientId(undefined);
      setEnrolledId(null);
    }
    setIsOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    try {
      const promise = enrollPatientMutation.mutateAsync({
        patientUserId: selectedPatientId.toString(),
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
      const enrollment = await promise;
      setSelectedPatientId(undefined);
      setEnrolledId(enrollment.id);
    } catch (error) {
      console.error("Error enrolling patient:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {enrolledId ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Paciente inscripto
              </DialogTitle>
              <DialogDescription>
                El siguiente paso es armar el plan de actividades.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Listo
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleClose(false);
                  navigate(
                    `/programas/${programId}/inscripciones/${enrolledId}`
                  );
                }}
              >
                Armar plan ahora
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Inscribir Paciente</DialogTitle>
              <DialogDescription>
                Buscá al paciente por DNI para inscribirlo en el programa.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <PatientSelect
                  value={selectedPatientId}
                  onValueChange={setSelectedPatientId}
                  placeholder="Buscar por DNI..."
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    enrollPatientMutation.isPending || !selectedPatientId
                  }
                >
                  Inscribir
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
