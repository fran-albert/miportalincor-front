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
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useCompanyMutations } from "@/hooks/Company/useCompanyMutations";

interface Props {
  id: number;
}

export default function DeleteCompanyDialog({ id }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteCompanyMutations } = useCompanyMutations();
  const { promiseToast } = useToastContext();

  const handleConfirmDelete = async () => {
    try {
      const promise = deleteCompanyMutations.mutateAsync(id);

      await promiseToast(promise, {
        loading: {
          title: "Eliminando empresa...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Empresa eliminada!",
          description: "La empresa se ha eliminado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al eliminar empresa",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al eliminar la Empresa", error);
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
          <DialogTitle>Eliminar Empresa</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar la empresa?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={deleteCompanyMutations.isPending}
          >
            {deleteCompanyMutations.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
