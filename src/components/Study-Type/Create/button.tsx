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
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudyTypeMutations } from "@/hooks/Study-Type/useStudyTypeMutations";
import { studyTypeSchema } from "@/validators/Study-Type/study-type.schema";
import { StudyType } from "@/types/Study-Type/Study-Type";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddStudyTypeDialog({ isOpen, setIsOpen }: Props) {
  const { addStudyTypeMutation } = useStudyTypeMutations();
  const { promiseToast } = useToastContext();
  const toggleDialog = () => {
    setIsOpen(!isOpen);
    form.reset();
  };
  const form = useForm<z.infer<typeof studyTypeSchema>>({
    resolver: zodResolver(studyTypeSchema),
  });

  async function onSubmit(values: z.infer<typeof studyTypeSchema>) {
    try {
      const promise = addStudyTypeMutation.mutateAsync(
        values as StudyType
      );

      await promiseToast(promise, {
        loading: {
          title: "Creando tipo de estudio...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Tipo de estudio creado!",
          description: "El tipo de estudio se ha creado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al crear tipo de estudio",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al crear el Tipo de Estudio", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Tipo de Estudio</DialogTitle>
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
                onClick={toggleDialog}
                className="capitalize"
                type="button"
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
