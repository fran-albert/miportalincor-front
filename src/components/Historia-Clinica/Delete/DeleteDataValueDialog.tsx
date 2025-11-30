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
import { FaRegTrashAlt } from "react-icons/fa";
import ActionIcon from "@/components/Icons/action";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DeleteDataValueDialogProps {
  idDataValue: string;
  itemType: "antecedente" | "medicación" | "evolución";
  itemDescription?: string;
  triggerButton?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DeleteDataValueDialog({
  idDataValue,
  itemType,
  itemDescription,
  triggerButton,
  isOpen: controlledIsOpen,
  onOpenChange,
  onSuccess,
}: DeleteDataValueDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);

  // Support both controlled and uncontrolled modes
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteDataValuesHCMutation } = useDataValuesMutations();
  const { promiseToast } = useToastContext();

  const getTypeMessages = () => {
    switch (itemType) {
      case "antecedente":
        return {
          title: "Eliminar Antecedente",
          description: "¿Estás seguro de que quieres eliminar este antecedente?",
          loading: "Eliminando antecedente...",
          success: "¡Antecedente eliminado!",
          successDescription: "El antecedente se ha eliminado exitosamente",
          error: "Error al eliminar antecedente",
        };
      case "medicación":
        return {
          title: "Eliminar Medicación",
          description: "¿Estás seguro de que quieres eliminar esta medicación?",
          loading: "Eliminando medicación...",
          success: "¡Medicación eliminada!",
          successDescription: "La medicación se ha eliminado exitosamente",
          error: "Error al eliminar medicación",
        };
      case "evolución":
        return {
          title: "Eliminar Evolución",
          description: "¿Estás seguro de que quieres eliminar esta evolución?",
          loading: "Eliminando evolución...",
          success: "¡Evolución eliminada!",
          successDescription: "La evolución se ha eliminado exitosamente",
          error: "Error al eliminar evolución",
        };
      default:
        return {
          title: "Eliminar Elemento",
          description: "¿Estás seguro de que quieres eliminar este elemento?",
          loading: "Eliminando elemento...",
          success: "¡Elemento eliminado!",
          successDescription: "El elemento se ha eliminado exitosamente",
          error: "Error al eliminar elemento",
        };
    }
  };

  const messages = getTypeMessages();

  const handleConfirmDelete = async () => {
    try {
      const promise = deleteDataValuesHCMutation.mutateAsync(idDataValue);

      await promiseToast(promise, {
        loading: {
          title: messages.loading,
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: messages.success,
          description: messages.successDescription,
        },
        error: (error: unknown) => {
          const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado";

          // Detectar error de restricción de 24 horas
          const is24HourError = errorMessage.includes("24 hours") || errorMessage.includes("24 horas");

          return {
            title: is24HourError ? "Restricción de tiempo" : messages.error,
            description: is24HourError
              ? "No se puede eliminar este elemento porque fue creado hace más de 24 horas. Los antecedentes solo pueden eliminarse dentro de las primeras 24 horas de su registro."
              : errorMessage,
          };
        },
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error(`Error al eliminar ${itemType}`, error);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" onClick={toggleDialog}>
      <ActionIcon
        tooltip="Eliminar"
        icon={<FaRegTrashAlt className="w-4 h-4" color="red" />}
      />
    </Button>
  );

  // If controlled externally, don't render the trigger
  const isControlled = controlledIsOpen !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {triggerButton || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{messages.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {messages.description}
          {itemDescription && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
              <strong>Elemento:</strong> {itemDescription}
            </div>
          )}
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={deleteDataValuesHCMutation.isPending}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}