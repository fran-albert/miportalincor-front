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
import { usePatientMutations } from "@/hooks/Patient/usePatientMutation";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

interface DeletePatientDialogProps {
  idPatient: number;
}

export default function DeletePatientDialog({
  idPatient,
}: DeletePatientDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deletePatientMutation } = usePatientMutations();

  const handleConfirmDelete = async () => {
    try {
      const deletePromise = deletePatientMutation.mutateAsync(idPatient);
      toast.promise(deletePromise, {
        loading: <LoadingToast message="Eliminando Paciente..." />,
        success: <SuccessToast message="Paciente eliminado con éxito" />,
        error: (err) => {
          console.error("Error al eliminar el Paciente", err);
          return <ErrorToast message="Error al eliminar el Paciente" />;
        },
      });
    } catch (error) {
      console.error("Error al eliminar el Paciente", error);
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
