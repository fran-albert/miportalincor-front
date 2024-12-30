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
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useBlodTestMutations } from "@/hooks/Blod-Test/useBlodTestMutation";

interface Props {
  blodTest: BloodTest;
}

export default function DeleteBlodTestDialog({
  blodTest,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteBlodTestMutation } = useBlodTestMutations();
  const handleConfirmDelete = async () => {
    try {
      const blodTestDeletionPromise = deleteBlodTestMutation.mutateAsync(
        Number(blodTest.id)
      );
      toast.promise(blodTestDeletionPromise, {
        loading: <LoadingToast message="Eliminando análisis bioquímico..." />,
        success: <SuccessToast message="Análisis bioquímico eliminado con éxito!" />,
        error: <ErrorToast message="Error al eliminar el Análisis Bioquímico" />,
        duration: 3000,
      });
      blodTestDeletionPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al eliminar el Análisis Bioquímico", error);
        });
    } catch (error) {
      console.error("Error al eliminar el Análisis Bioquímico", error);
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
          <DialogTitle>Eliminar {blodTest.originalName}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar el análisis bioquímico{" "}
          {blodTest.originalName}?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-greenPrimary"
            onClick={handleConfirmDelete}
            disabled={deleteBlodTestMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
