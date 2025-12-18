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
import { UserMinus } from "lucide-react";
import ActionIcon from "@/components/Icons/action";
import { useSecretaryMutations } from "@/hooks/Secretary/useSecretaryMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ApiError } from "@/types/Error/ApiError";

interface DeleteSecretaryDialogProps {
  idSecretary: string;
}

export default function DeleteSecretaryDialog({
  idSecretary,
}: DeleteSecretaryDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => {
    setIsOpen(!isOpen);
  };
  const { deleteSecretaryMutation } = useSecretaryMutations();
  const { promiseToast } = useToastContext();

  const handleConfirmDeactivate = async () => {
    try {
      const promise = deleteSecretaryMutation.mutateAsync(idSecretary);

      await promiseToast(promise, {
        loading: {
          title: "Desactivando secretaria...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Secretaria desactivada!",
          description: "La secretaria se ha desactivado exitosamente. Podrás reactivarla cuando lo necesites.",
        },
        error: (error: ApiError) => ({
          title: "Error al desactivar secretaria",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al desactivar la secretaria", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleDialog}>
          <ActionIcon
            tooltip="Desactivar"
            icon={<UserMinus className="w-4 h-4 text-red-600" />}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Desactivar Secretaria</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres desactivar esta secretaria? No podrá acceder al sistema hasta que la reactives.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirmDeactivate}
            disabled={deleteSecretaryMutation.isPending}
          >
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
