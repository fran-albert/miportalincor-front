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
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import ActionIcon from "@/components/Icons/action";
import { FaRegTrashAlt } from "react-icons/fa";
import { useHealthInsuranceMutations } from "@/hooks/Health-Insurance/useHealthInsuranceMutation";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

interface DeleteHealthInsuranceDialogProps {
  healthInsurance: HealthInsurance;
}

export default function DeleteHealthInsuranceDialog({
  healthInsurance,
}: DeleteHealthInsuranceDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteHealthInsuranceMutation } = useHealthInsuranceMutations();
  const handleConfirmDelete = async () => {
    try {
      const healthInsuranceDeletionPromise =
        deleteHealthInsuranceMutation.mutateAsync(Number(healthInsurance.id));
        toast.promise(healthInsuranceDeletionPromise, {
            loading: <LoadingToast message="Eliminando obra social..." />,
            success: <SuccessToast message="Obra Social eliminada con éxito!" />,
            error: <ErrorToast message="Error al eliminar la Obra Social" />,
            duration: 3000,
          });
      healthInsuranceDeletionPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear la Obra Social", error);
        });
    } catch (error) {
      console.error("Error al crear la Obra Social", error);
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
