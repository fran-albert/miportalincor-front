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
import { useActivityMutations } from "@/hooks/Program/useActivityMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  CreateActivitySchema,
  CreateActivityFormValues,
} from "@/validators/Program/activity.schema";

interface CreateActivityDialogProps {
  programId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreateActivityDialog({
  programId,
  isOpen,
  setIsOpen,
}: CreateActivityDialogProps) {
  const { createActivityMutation } = useActivityMutations(programId);
  const { promiseToast } = useToastContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateActivityFormValues>({
    resolver: zodResolver(CreateActivitySchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (data: CreateActivityFormValues) => {
    try {
      const promise = createActivityMutation.mutateAsync(data);
      await promiseToast(promise, {
        loading: {
          title: "Creando actividad...",
          description: "Procesando",
        },
        success: {
          title: "Actividad creada",
          description: "La actividad se creó correctamente.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo crear la actividad.",
        }),
      });
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating activity:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Actividad</DialogTitle>
          <DialogDescription>
            Ingresá los datos de la nueva actividad.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Gimnasio, Nutrición"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la actividad (opcional)"
              {...register("description")}
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
            <Button
              type="submit"
              disabled={createActivityMutation.isPending}
            >
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
