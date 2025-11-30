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
import { Speciality } from "@/types/Speciality/Speciality";
import ActionIcon from "@/components/Icons/action";
import { useSpecialityMutations } from "@/hooks/Speciality/useSpecialityMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DeleteSpecialityDialogProps {
  speciality: Speciality;
}

export default function DeleteSpecialityDialog({
  speciality,
}: DeleteSpecialityDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteSpecialityMutation } = useSpecialityMutations();
  const { promiseToast } = useToastContext();
  const handleConfirmDelete = async () => {
    try {
      const promise = deleteSpecialityMutation.mutateAsync(
        Number(speciality.id)
      );

      await promiseToast(promise, {
        loading: {
          title: "Eliminando especialidad...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Especialidad eliminada!",
          description: "La especialidad se ha eliminado exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al eliminar especialidad",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al eliminar la Especialidad", error);
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
          <DialogTitle>Eliminar {speciality.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar la especialidad{" "}
          {speciality.name}?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-greenPrimary"
            onClick={handleConfirmDelete}
            disabled={deleteSpecialityMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
