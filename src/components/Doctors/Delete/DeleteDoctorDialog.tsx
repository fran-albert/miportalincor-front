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
import ActionIcon from "@/components/Icons/action";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";

interface DeleteDoctorDialogProps {
  idDoctor: number;
}

export default function DeleteDoctorDialog({
  idDoctor,
}: DeleteDoctorDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteDoctorMutation } = useDoctorMutations();
  const handleConfirmDelete = async () => {
    try {
      const doctorDeletionPromise = deleteDoctorMutation.mutateAsync(idDoctor);
      toast.promise(doctorDeletionPromise, {
        loading: "Eliminando médico...",
        success: "Médico eliminado con éxito!",
        error: "Error al eliminar el médico",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al eliminar el médico", error);
      toast.error("Error al eliminar el médico");
    } finally {
      setIsOpen(false);
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
          <DialogTitle>Eliminar Médico</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar el médico?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            variant="incor"
            onClick={handleConfirmDelete}
            disabled={deleteDoctorMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
