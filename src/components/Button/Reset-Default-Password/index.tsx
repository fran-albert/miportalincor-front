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
import { useUserMutations } from "@/hooks/User/useUserMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ApiError } from "@/types/Error/ApiError";

interface Props {
  idUser: number;
}

export default function ResetDefaultPasswordDialog({ idUser }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { resetPasswordToDniMutation } = useUserMutations();
  const { promiseToast } = useToastContext();
  const onSubmit = async () => {
    try {
      await promiseToast(resetPasswordToDniMutation.mutateAsync(String(idUser)), {
        loading: {
          title: "Restableciendo contraseña",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Contraseña restablecida",
          description: "La contraseña se restableció exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al restablecer la contraseña",
          description: error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
    } catch (error) {
      console.error("Hubo un error al restablecer la contraseña", error);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          onClick={toggleDialog}
          className="w-full text-greenPrimary"
        >
          Restablecer contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Restablecer Contraseña</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro que deseas restablecer la contraseña por defecto? La
          nueva contraseña será el DNI del usuario.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button type="submit" variant="incor" onClick={onSubmit}>
            Restablecer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
