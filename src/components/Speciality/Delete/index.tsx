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
import { toast } from "sonner";
import { Speciality } from "@/types/Speciality/Speciality";
import ActionIcon from "@/components/Icons/action";
import { useSpecialityMutations } from "@/hooks/Speciality/useSpecialityMutation";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

interface DeleteSpecialityDialogProps {
  speciality: Speciality;
}

export default function DeleteSpecialityDialog({
  speciality,
}: DeleteSpecialityDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteSpecialityMutation } = useSpecialityMutations();
  const handleConfirmDelete = async () => {
    try {
      const specialityDeletionPromise = deleteSpecialityMutation.mutateAsync(
        Number(speciality.id)
      );
      toast.promise(specialityDeletionPromise, {
        loading: <LoadingToast message="Eliminando especialidad..." />,
        success: <SuccessToast message="Especialidad eliminada con éxito!" />,
        error: <ErrorToast message="Error al eliminar la Especialidad" />,
        duration: 3000,
      });
      specialityDeletionPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear la Especialidad", error);
        });
    } catch (error) {
      console.error("Error al crear la Especialidad", error);
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
