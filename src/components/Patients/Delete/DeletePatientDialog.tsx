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
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deletePatientMutation } = usePatientMutations();
  const { promiseToast } = useToastContext();

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
        error: (error: any) => ({
          title: "Error al eliminar paciente",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
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
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar el paciente?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={deletePatientMutation.isPending}
          >
            {deletePatientMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
