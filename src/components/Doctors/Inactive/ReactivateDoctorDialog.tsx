import { useState } from "react";
import { isAxiosError } from "axios";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useReactivateDoctor } from "@/hooks/Doctor/useDoctorActivation";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface ReactivateDoctorDialogProps {
  doctorId: string;
  doctorName: string;
}

export default function ReactivateDoctorDialog({
  doctorId,
  doctorName,
}: ReactivateDoctorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reactivateMutation = useReactivateDoctor();
  const { showSuccess, showError } = useToastContext();

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync(doctorId);
      showSuccess("Médico reactivado", `${doctorName} vuelve a aparecer en agendas y listados.`);
      setIsOpen(false);
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      showError("No se pudo reactivar", message ?? "Probá de nuevo en un rato.");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reactivar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivar médico</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-gray-900">{doctorName}</span> va a poder ingresar
            de nuevo y vuelve a aparecer en agendas y listados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={reactivateMutation.isPending}>Cancelar</AlertDialogCancel>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleReactivate}
            disabled={reactivateMutation.isPending}
          >
            {reactivateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reactivar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
