import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useSpecialityMutations } from "@/hooks/Speciality/useSpecialityMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { specialitySchema } from "@/validators/speciality.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface AddSpecialityDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddSpecialityDialog({
  isOpen,
  setIsOpen,
}: AddSpecialityDialogProps) {
  const { addSpecialityMutation } = useSpecialityMutations();
  const { promiseToast } = useToastContext();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof specialitySchema>>({
    resolver: zodResolver(specialitySchema),
  });

  async function onSubmit(values: z.infer<typeof specialitySchema>) {
    try {
      const promise = addSpecialityMutation.mutateAsync(values);

      await promiseToast(promise, {
        loading: {
          title: "Creando especialidad...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Especialidad creada!",
          description: "La especialidad se ha creado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al crear especialidad",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al crear la Especialidad", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Especialidad</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black capitalize">
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex items-center justify-between mt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="capitalize"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className=" bg-greenPrimary hover:bg-greenPrimary text-white font-bold py-2 px-4 rounded-md transition duration-300 capitalize"
                variant="default"
              >
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
