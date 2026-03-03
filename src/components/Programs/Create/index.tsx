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
import { useProgramMutations } from "@/hooks/Program/useProgramMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  CreateProgramSchema,
  CreateProgramFormValues,
} from "@/validators/Program/program.schema";

interface CreateProgramDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreateProgramDialog({
  isOpen,
  setIsOpen,
}: CreateProgramDialogProps) {
  const { createProgramMutation } = useProgramMutations();
  const { promiseToast } = useToastContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProgramFormValues>({
    resolver: zodResolver(CreateProgramSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (data: CreateProgramFormValues) => {
    try {
      const promise = createProgramMutation.mutateAsync(data);
      await promiseToast(promise, {
        loading: {
          title: "Creando programa...",
          description: "Procesando la solicitud",
        },
        success: {
          title: "Programa creado",
          description: "El programa se creó correctamente.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo crear el programa.",
        }),
      });
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Programa</DialogTitle>
          <DialogDescription>
            Ingresá los datos del nuevo programa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Nombre del programa"
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
              placeholder="Descripción del programa (opcional)"
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
            <Button type="submit" disabled={createProgramMutation.isPending}>
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
