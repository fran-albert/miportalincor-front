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
import { toast } from "sonner";
import ActionIcon from "@/components/Icons/action";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { useCompanyMutations } from "@/hooks/Company/useCompanyMutations";

interface Props {
  id: number;
}

export default function DeleteCompanyDialog({ id }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteCompanyMutations } = useCompanyMutations();

  const handleConfirmDelete = async () => {
    try {
      const deletePromise = deleteCompanyMutations.mutateAsync(id);
      toast.promise(deletePromise, {
        loading: <LoadingToast message="Eliminando Empresa..." />,
        success: <SuccessToast message="Empresa eliminada con éxito" />,
        error: (err) => {
          console.error("Error al eliminar la Empresa", err);
          return <ErrorToast message="Error al eliminar la Empresa" />;
        },
      });
    } catch (error) {
      console.error("Error al eliminar la Empresa", error);
    } finally {
      setIsOpen(false);
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
