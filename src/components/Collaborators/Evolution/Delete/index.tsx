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
import { useEvolutionMutations } from "@/hooks/Evolutions/useEvolutionMutations";

interface Props {
  id: number;
}

export default function DeleteEvolutionDialog({ id }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const { deleteEvolutionMutation } = useEvolutionMutations();

  const handleConfirmDelete = async () => {
    try {
      const deletePromise = deleteEvolutionMutation.mutateAsync(id);
      toast.promise(deletePromise, {
        loading: <LoadingToast message="Eliminando Evolución..." />,
        success: <SuccessToast message="Evolución eliminada con éxito" />,
        error: (err) => {
          console.error("Error al eliminar la Evolución", err);
          const errorMessage = err?.response?.data?.message || 
                              err?.message || 
                              "Error al eliminar la Evolución";
          return <ErrorToast message={errorMessage} />;
        },
      });
    } catch (error) {
      console.error("Error al eliminar la Evolución", error);
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
          <DialogTitle>Eliminar Evolución</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          ¿Estás seguro de que quieres eliminar esta evolución? Esta acción no se puede deshacer.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={toggleDialog}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleConfirmDelete}
            disabled={deleteEvolutionMutation.isPending}
          >
            {deleteEvolutionMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}