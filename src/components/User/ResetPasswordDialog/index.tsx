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
import { KeyRound } from "lucide-react";

interface Props {
  user: User;
  onSuccess: () => void;
}

export default function ResetPasswordDialog({ user, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const { showSuccess, showError } = useToastContext();
  const { resetPasswordToDniMutation } = useUserMutations();

  const requiredText = "RESETEAR";
  const isConfirmationValid = confirmationText === requiredText;

  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      showError("Error", `Por favor escribe "${requiredText}" para confirmar`);
      return;
    }

    try {
      await resetPasswordToDniMutation.mutateAsync(user.userName);
      showSuccess(
        "Contraseña reseteada",
        `La contraseña de ${user.firstName} ${user.lastName} ha sido reseteada a su DNI`
      );
      setIsOpen(false);
      setConfirmationText("");
      onSuccess();
    } catch (error) {
      const apiError = error as ApiError;
      showError(
        "Error",
        apiError.response?.data?.message || "Error al resetear la contraseña"
      );
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
        <Button variant="outline" size="sm" title="Resetear contraseña">
          <KeyRound className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resetear Contraseña</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por <strong>resetear la contraseña</strong> de{" "}
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            . La nueva contraseña será su DNI: <strong>{user.userName}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirmation">
            Para confirmar, escribe <strong>{requiredText}</strong>:
          </Label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
            placeholder={requiredText}
            className="uppercase"
          />
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || resetPasswordToDniMutation.isPending}
          >
            {resetPasswordToDniMutation.isPending
              ? "Procesando..."
              : "Resetear Contraseña"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
