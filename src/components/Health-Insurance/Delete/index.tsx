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
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import ActionIcon from "@/components/Icons/action";
import { FaRegTrashAlt } from "react-icons/fa";
import { useHealthInsuranceMutations } from "@/hooks/Health-Insurance/useHealthInsuranceMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DeleteHealthInsuranceDialogProps {
  healthInsurance: HealthInsurance;
}

export default function DeleteHealthInsuranceDialog({
  healthInsurance,
}: DeleteHealthInsuranceDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteHealthInsuranceMutation } = useHealthInsuranceMutations();
  const { promiseToast } = useToastContext();
  const handleConfirmDelete = async () => {
    try {
      const promise = deleteHealthInsuranceMutation.mutateAsync(Number(healthInsurance.id));

      await promiseToast(promise, {
        loading: {
          title: "Eliminando obra social...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Obra social eliminada!",
          description: "La obra social se ha eliminado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al eliminar obra social",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al eliminar la Obra Social", error);
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
          <DialogTitle>Eliminar {healthInsurance.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar la obra social{" "}
          {healthInsurance.name}?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            variant="incor"
            onClick={handleConfirmDelete}
            disabled={deleteHealthInsuranceMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
