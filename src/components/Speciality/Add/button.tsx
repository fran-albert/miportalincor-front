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
import { useSpecialityMutations } from "@/hooks/Speciality/useHealthInsuranceMutation";
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
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof specialitySchema>>({
    resolver: zodResolver(specialitySchema),
  });

  async function onSubmit(values: z.infer<typeof specialitySchema>) {
    try {
      const specialityCreationPromise =
        addSpecialityMutation.mutateAsync(values);
      toast.promise(specialityCreationPromise, {
        loading: <LoadingToast message="Creando especialidad..." />,
        success: <SuccessToast message="Especialidad creada con exito!" />,
        error: <ErrorToast message="Hubo un error al crear la Especialidad." />,
      });
      specialityCreationPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear la Especialidad", error);
        });
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
