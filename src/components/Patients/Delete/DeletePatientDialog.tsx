import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaRegTrashAlt } from "react-icons/fa";
import ActionIcon from "@/components/Icons/action";
import { usePatientMutations } from "@/hooks/Patient/usePatientMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DeletePatientDialogProps {
  idPatient: number;
}

export default function DeletePatientDialog({
  idPatient,
}: DeletePatientDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const toggleDialog = () => {
    setIsOpen(!isOpen);
    setConfirmText(""); // Limpiar el input al cerrar
  };
  const { deletePatientMutation } = usePatientMutations();
  const { promiseToast } = useToastContext();
  const isConfirmValid = confirmText === "ELIMINAR";

  const handleConfirmDelete = async () => {
    try {
      const promise = deletePatientMutation.mutateAsync(idPatient);

      await promiseToast(promise, {
        loading: {
          title: "Eliminando paciente...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Paciente eliminado!",
          description: "El paciente se ha eliminado exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al eliminar paciente",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
      setConfirmText(""); // Limpiar el input después de eliminar
    } catch (error) {
      console.error("Error al eliminar el Paciente", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleDialog}>
          <ActionIcon
            tooltip="Eliminar"
            icon={<FaRegTrashAlt className="w-4 h-4" color="red" />}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar Paciente</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar el paciente? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              Para confirmar, escribe: <span className="font-bold text-red-600">ELIMINAR</span>
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe 'ELIMINAR' para confirmar"
              className="w-full"
              disabled={deletePatientMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={!isConfirmValid || deletePatientMutation.isPending}
          >
            {deletePatientMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
