import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useProgramMutations } from "@/hooks/Program/useProgramMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Program } from "@/types/Program/Program";

interface DeleteProgramDialogProps {
  program: Program;
}

export default function DeleteProgramDialog({
  program,
}: DeleteProgramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteProgramMutation } = useProgramMutations();
  const { promiseToast } = useToastContext();

  const handleDelete = async () => {
    try {
      const promise = deleteProgramMutation.mutateAsync(program.id);
      await promiseToast(promise, {
        loading: {
          title: "Eliminando...",
          description: "Eliminando el programa",
        },
        success: {
          title: "Programa eliminado",
          description: "El programa se eliminó correctamente.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo eliminar el programa.",
        }),
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar Programa</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés eliminar el programa &quot;{program.name}
            &quot;? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProgramMutation.isPending}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
