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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaRegTrashAlt } from "react-icons/fa";
import ActionIcon from "@/components/Icons/action";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ApiError } from "@/types/Error/ApiError";

interface DeleteDoctorDialogProps {
  idDoctor: string;
}

export default function DeleteDoctorDialog({
  idDoctor,
}: DeleteDoctorDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const toggleDialog = () => {
    setIsOpen(!isOpen);
    setConfirmText(""); // Limpiar el input al cerrar
  };
  const { deleteDoctorMutation } = useDoctorMutations();
  const { promiseToast } = useToastContext();
  const isConfirmValid = confirmText === "ELIMINAR";
  const handleConfirmDelete = async () => {
    try {
      const promise = deleteDoctorMutation.mutateAsync(idDoctor);

      await promiseToast(promise, {
        loading: {
          title: "Eliminando médico...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Médico eliminado!",
          description: "El médico se ha eliminado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al eliminar médico",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
      setConfirmText(""); // Limpiar el input después de eliminar
    } catch (error) {
      console.error("Error al eliminar el médico", error);
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
          <DialogTitle>Eliminar Médico</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar el médico? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              Para confirmar, escribe: <span className="font-bold text-red-600">ELIMINAR</span>
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe 'ELIMINAR' para confirmar"
              className="w-full"
              disabled={deleteDoctorMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={!isConfirmValid || deleteDoctorMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
