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
import { useCollaboratorMutations } from "@/hooks/Collaborator/useCollaboratorMutation";
import { ApiError } from "@/types/Error/ApiError";

interface Props {
  id: number;
}

export default function DeleteCollaboratorDialog({ id }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteCollaboratorMutation } = useCollaboratorMutations();
  const { promiseToast } = useToastContext();

  const handleConfirmDelete = async () => {
    try {
      const promise = deleteCollaboratorMutation.mutateAsync(id);

      await promiseToast(promise, {
        loading: {
          title: "Eliminando colaborador...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Colaborador eliminado!",
          description: "El colaborador se ha eliminado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al eliminar colaborador",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al eliminar el Colaborador", error);
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
          <DialogTitle>Eliminar Colaborador</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar el colaborador?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={deleteCollaboratorMutation.isPending}
          >
            {deleteCollaboratorMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
