import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useUserMutations } from "@/hooks/User/useUserMutations";
import { User } from "@/types/User/User";
import { ApiError } from "@/types/Error/ApiError";

interface Props {
  user: User;
  onSuccess: () => void;
}

export default function ToggleUserStatusDialog({ user, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const { showSuccess, showError } = useToastContext();
  const { activateUserMutation, deactivateUserMutation } = useUserMutations();

  const isActivating = !user.active;
  const requiredText = isActivating ? "ACTIVAR" : "DESACTIVAR";
  const isConfirmationValid = confirmationText === requiredText;

  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      showError("Error", `Por favor escribe "${requiredText}" para confirmar`);
      return;
    }

    try {
      if (isActivating) {
        await activateUserMutation.mutateAsync(user.id.toString());
        showSuccess("Usuario activado", `${user.firstName} ${user.lastName} ha sido activado exitosamente`);
      } else {
        await deactivateUserMutation.mutateAsync(user.id.toString());
        showSuccess("Usuario desactivado", `${user.firstName} ${user.lastName} ha sido desactivado exitosamente`);
      }
      setIsOpen(false);
      setConfirmationText("");
      onSuccess();
    } catch (error) {
      const apiError = error as ApiError;
      showError("Error", apiError.response?.data?.message || `Error al ${isActivating ? "activar" : "desactivar"} el usuario`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmationText("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant={isActivating ? "default" : "destructive"}
          size="sm"
        >
          {isActivating ? "Activar" : "Desactivar"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActivating ? "Activar" : "Desactivar"} Usuario
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActivating ? (
              <>
                Estás por <strong>activar</strong> a{" "}
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                . El usuario podrá acceder al sistema nuevamente.
              </>
            ) : (
              <>
                Estás por <strong>desactivar</strong> a{" "}
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                . El usuario no podrá acceder al sistema hasta que sea activado
                nuevamente.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirmation">
            Para confirmar, escribe <strong>{requiredText}</strong>:
          </Label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={requiredText}
            className="uppercase"
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant={isActivating ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={!isConfirmationValid || activateUserMutation.isPending || deactivateUserMutation.isPending}
          >
            {activateUserMutation.isPending || deactivateUserMutation.isPending
              ? "Procesando..."
              : isActivating
              ? "Activar Usuario"
              : "Desactivar Usuario"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
