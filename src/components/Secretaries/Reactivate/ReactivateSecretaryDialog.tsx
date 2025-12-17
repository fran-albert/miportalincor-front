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
import { RefreshCw } from "lucide-react";
import ActionIcon from "@/components/Icons/action";
import { useSecretaryMutations } from "@/hooks/Secretary/useSecretaryMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ApiError } from "@/types/Error/ApiError";

interface ReactivateSecretaryDialogProps {
  idSecretary: string;
}

export default function ReactivateSecretaryDialog({
  idSecretary,
}: ReactivateSecretaryDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => {
    setIsOpen(!isOpen);
  };
  const { reactivateSecretaryMutation } = useSecretaryMutations();
  const { promiseToast } = useToastContext();

  const handleConfirmReactivate = async () => {
    try {
      const promise = reactivateSecretaryMutation.mutateAsync(idSecretary);

      await promiseToast(promise, {
        loading: {
          title: "Reactivando secretaria...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Secretaria reactivada!",
          description: "La secretaria se ha reactivado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al reactivar secretaria",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al reactivar la secretaria", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleDialog}>
          <ActionIcon
            tooltip="Reactivar"
            icon={<RefreshCw className="w-4 h-4 text-green-600" />}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reactivar Secretaria</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres reactivar esta secretaria? Podrá volver a acceder al sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmReactivate}
            disabled={reactivateSecretaryMutation.isPending}
          >
            Reactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
