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
        loading: "Subiendo estudio...",
        success: "Estudio subido con éxito!",
        error: "Error al agregar el estudio",
      });
    } catch (error) {
      console.error("Error al agregar el estudio", error);
      toast.error("Error al agregar el estudio");
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
