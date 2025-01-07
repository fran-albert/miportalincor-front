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
  const handleConfirmDelete = async () => {
    try {
      const studyTypeDeletionPromise = deleteStudyTypeMutation.mutateAsync(
        Number(studyType.id)
      );
      toast.promise(studyTypeDeletionPromise, {
        loading: <LoadingToast message="Eliminando tipo de estudio..." />,
        success: <SuccessToast message="Tipo de estudio eliminado con éxito!" />,
        error: <ErrorToast message="Error al eliminar el tipo de estudio" />,
        duration: 3000,
      });
      studyTypeDeletionPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear el tipo de estudio", error);
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
