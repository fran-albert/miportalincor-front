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
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useCollaboratorMedicalEvaluationMutations } from "@/hooks/Collaborator-Medical-Evaluation/useCollaboratorMedicalEvaluationMutations";
import { ApiError } from "@/types/Error/ApiError";

interface Props {
  id: number;
}

export default function DeleteMedicalEvaluation({ id }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteCollaboratorMedicalEvaluationMutation } =
    useCollaboratorMedicalEvaluationMutations();
  const { promiseToast } = useToastContext();

  const handleConfirmDelete = async () => {
    try {
      const deletePromise = deleteCollaboratorMedicalEvaluationMutation.mutateAsync(id);
      await promiseToast(deletePromise, {
        loading: {
          title: "Eliminando Examen",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Examen eliminado",
          description: "El examen se eliminó exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al eliminar el examen",
          description: error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
    } catch (error) {
      console.error("Error al eliminar el Examen", error);
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
          <DialogTitle>Eliminar Examen</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar el examen? Se perderán todos los
          datos.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={deleteCollaboratorMedicalEvaluationMutation.isPending}
          >
            {deleteCollaboratorMedicalEvaluationMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
