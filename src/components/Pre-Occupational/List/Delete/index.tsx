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
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { useCollaboratorMedicalEvaluationMutations } from "@/hooks/Collaborator-Medical-Evaluation/useCollaboratorMedicalEvaluationMutations";

interface Props {
  id: number;
}

export default function DeleteMedicalEvaluation({ id }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteCollaboratorMedicalEvaluationMutation } =
    useCollaboratorMedicalEvaluationMutations();

  const handleConfirmDelete = async () => {
    try {
      const deletePromise = deleteCollaboratorMedicalEvaluationMutation.mutateAsync(id);
      toast.promise(deletePromise, {
        loading: <LoadingToast message="Eliminando Examen..." />,
        success: <SuccessToast message="Examnn eliminado con éxito" />,
        error: (err) => {
          console.error("Error al eliminar el Examen", err);
          return <ErrorToast message="Error al eliminar el Examen" />;
        },
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
