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
import { toast } from "sonner";
import { Study } from "@/types/Study/Study";
import ActionIcon from "@/components/Icons/action";
import { FaRegTrashAlt } from "react-icons/fa";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";

interface DeleteStudyDialogProps {
  idStudy: number;
  studies: Study[];
}

export default function DeleteStudyDialog({
  idStudy,
  studies,
}: DeleteStudyDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteStudyMutation } = useStudyMutations();
  const handleConfirmDelete = async () => {
    try {
      toast.promise(deleteStudyMutation.mutateAsync(idStudy), {
        loading: "Eliminando estudio...",
        success: "Estudio eliminado con éxito!",
        error: "Error al eliminar el estudio",
      });
    } catch (error) {
      console.error("Error al eliminar el estudio", error);
      toast.error("Error al eliminar el estudio");
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
