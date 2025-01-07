import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
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
  const toggleDialog = () => {
    setIsOpen(!isOpen);
    form.reset();
  };
  const form = useForm<z.infer<typeof studyTypeSchema>>({
    resolver: zodResolver(studyTypeSchema),
  });

  async function onSubmit(values: z.infer<typeof studyTypeSchema>) {
    try {
      const studyTypeCreationPromise = addStudyTypeMutation.mutateAsync(
        values as StudyType
      );
      toast.promise(studyTypeCreationPromise, {
        loading: <LoadingToast message="Creando tipo de estudio..." />,
        success: <SuccessToast message="Tipo de estudio creado con exito!" />,
        error: (
          <ErrorToast message="Hubo un error al crear el Tipo de estudio." />
        ),
      });
      studyTypeCreationPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear el Tipo de Estudio", error);
        });
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
