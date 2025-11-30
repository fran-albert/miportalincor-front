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
import { ApiError } from "@/types/Error/ApiError";
import { Evolucion } from "@/types/Antecedentes/Antecedentes";

interface DeleteConsultaDialogProps {
  evoluciones: Evolucion[];
  consultaDescription?: string;
  triggerButton?: React.ReactNode;
}

export default function DeleteConsultaDialog({
  evoluciones,
  consultaDescription,
  triggerButton,
}: DeleteConsultaDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteDataValuesHCMutation } = useDataValuesMutations();
  const { promiseToast } = useToastContext();

  const handleConfirmDelete = async () => {
    if (!evoluciones || evoluciones.length === 0) return;
    
    setIsDeleting(true);
    
    try {
      // Eliminar todas las evoluciones de la consulta una por una
      const deletePromises = evoluciones.map((evolucion) =>
        deleteDataValuesHCMutation.mutateAsync(String(evolucion.id))
      );

      const promise = Promise.all(deletePromises);

      await promiseToast(promise, {
        loading: {
          title: "Eliminando consulta...",
          description: `Eliminando ${evoluciones.length} evolución(es) de la consulta`,
        },
        success: {
          title: "¡Consulta eliminada!",
          description: "La consulta completa se ha eliminado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al eliminar consulta",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al eliminar consulta completa", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" onClick={toggleDialog}>
      <ActionIcon
        tooltip="Eliminar consulta completa"
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
          <DialogTitle>Eliminar Consulta Completa</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar esta consulta completa? 
          Esto eliminará todas las evoluciones asociadas ({evoluciones?.length || 0} evolución(es)).
          {consultaDescription && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
              <strong>Consulta:</strong> {consultaDescription}
            </div>
          )}
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
            <strong>⚠️ Esta acción no se puede deshacer</strong>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar Consulta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}