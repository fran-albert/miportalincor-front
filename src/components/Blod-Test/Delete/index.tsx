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
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useBlodTestMutations } from "@/hooks/Blod-Test/useBlodTestMutation";
import { ApiError } from "@/types/Error/ApiError";

interface Props {
  blodTest: BloodTest;
}

export default function DeleteBlodTestDialog({
  blodTest,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteBlodTestMutation } = useBlodTestMutations();
  const { promiseToast } = useToastContext();
  const handleConfirmDelete = async () => {
    try {
      const promise = deleteBlodTestMutation.mutateAsync(
        Number(blodTest.id)
      );

      await promiseToast(promise, {
        loading: {
          title: "Eliminando análisis bioquímico...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Análisis bioquímico eliminado!",
          description: "El análisis bioquímico se ha eliminado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al eliminar análisis bioquímico",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
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
