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
import { SubmitHandler } from "react-hook-form";
import { useUserMutations } from "@/hooks/User/useUserMutations";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
interface Props {
  idUser: number;
}

export default function ResetDefaultPasswordDialog({ idUser }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { resetDefaultPasswordMutation } = useUserMutations();
  const onSubmit: SubmitHandler<any> = async () => {
    try {
      toast.promise(resetDefaultPasswordMutation.mutateAsync(idUser), {
        loading: (
          <LoadingToast message="Restableciendo contraseña del paciente..." />
        ),
        success: <SuccessToast message="Contraseña restablecida con exito!" />,
        error: (
          <ErrorToast message="Hubo un error al restablecer la contraseña." />
        ),
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
