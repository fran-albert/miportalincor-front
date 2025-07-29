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
import { StudyType } from "@/types/Study-Type/Study-Type";
import { useStudyTypeMutations } from "@/hooks/Study-Type/useStudyTypeMutations";

interface Props {
  studyType: StudyType;
}

export default function DeleteStudyTypeDialog({
  studyType,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteStudyTypeMutation } = useStudyTypeMutations();
  const { promiseToast } = useToastContext();
  const handleConfirmDelete = async () => {
    try {
      const studyTypeDeletionPromise = deleteStudyTypeMutation.mutateAsync(
        Number(studyType.id)
      );
      await promiseToast(studyTypeDeletionPromise, {
        loading: {
          title: "Eliminando tipo de estudio...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Tipo de estudio eliminado!",
          description: "El tipo de estudio se ha eliminado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al eliminar tipo de estudio",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
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
          <DialogTitle>Eliminar {studyType.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar el tipo de estudio{" "}
          {studyType.name}?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-greenPrimary"
            onClick={handleConfirmDelete}
            disabled={deleteStudyTypeMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
