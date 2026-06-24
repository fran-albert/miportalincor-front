import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useProgramMutations } from "@/hooks/Program/useProgramMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Program } from "@/types/Program/Program";
import {
  UpdateProgramSchema,
  UpdateProgramFormValues,
} from "@/validators/Program/program.schema";

interface EditProgramDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  program: Program;
}

export default function EditProgramDialog({
  isOpen,
  setIsOpen,
  program,
}: EditProgramDialogProps) {
  const { updateProgramMutation } = useProgramMutations();
  const { promiseToast } = useToastContext();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateProgramFormValues>({
    resolver: zodResolver(UpdateProgramSchema),
    defaultValues: {
      name: program.name,
      description: program.description ?? "",
      isActive: program.isActive,
    },
  });

  const onSubmit = async (data: UpdateProgramFormValues) => {
    try {
      const promise = updateProgramMutation.mutateAsync({
        id: program.id,
        dto: data,
      });
      await promiseToast(promise, {
        loading: {
          title: "Actualizando programa...",
          description: "Procesando la solicitud",
        },
        success: {
          title: "Programa actualizado",
          description: "El programa se actualizó correctamente.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo actualizar el programa.",
        }),
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating program:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Programa</DialogTitle>
          <DialogDescription>
            Modificá los datos del programa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Activo</Label>
            <Switch
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProgramMutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
