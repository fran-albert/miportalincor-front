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
import { StudiesWithURL } from "@/types/Study/Study";
import ActionIcon from "@/components/Icons/action";
import { FaRegTrashAlt } from "react-icons/fa";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DeleteStudyDialogProps {
  idStudy: number;
  studies: StudiesWithURL[];
  userId: number;
}

export default function DeleteStudyDialog({
  idStudy,
  userId,
  studies,
}: DeleteStudyDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteStudyMutation } = useStudyMutations();
  const { promiseToast } = useToastContext();
  const handleConfirmDelete = async () => {
    try {
      const promise = deleteStudyMutation.mutateAsync({
        studyId: idStudy,
        userId: userId,
      });

      await promiseToast(promise, {
        loading: {
          title: "Eliminando estudio...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Estudio eliminado!",
          description: "El estudio se ha eliminado exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al eliminar estudio",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al eliminar el estudio", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleDialog}>
          <ActionIcon
            tooltip="Eliminar"
            icon={<FaRegTrashAlt size={15} className="text-red-600" />}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Eliminar{" "}
            {studies.map((study) => study.id === idStudy && study.note)}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar el estudio?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button variant="incor" onClick={handleConfirmDelete}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
