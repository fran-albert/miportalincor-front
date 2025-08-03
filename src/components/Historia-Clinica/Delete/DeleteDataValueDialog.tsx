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
}

export default function DeleteDataValueDialog({
  idDataValue,
  itemType,
  itemDescription,
  triggerButton,
}: DeleteDataValueDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
        error: (error: any) => ({
          title: messages.error,
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
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