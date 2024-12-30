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
import { useEffect } from "react";
import { useBlodTestMutations } from "@/hooks/Blod-Test/useBlodTestMutation";
import { bloodTestSchema } from "@/validators/Blod-Test/blod-test.schema";
import { UnitSelect } from "@/components/Select/Unit/select";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddBlodTestDialog({ isOpen, setIsOpen }: Props) {
  const { addBlodTestMutation } = useBlodTestMutations();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof bloodTestSchema>>({
    resolver: zodResolver(bloodTestSchema),
  });

  const { reset } = form;

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  async function onSubmit(values: z.infer<typeof bloodTestSchema>) {
    try {
      const payload = {
        originalName: values.originalName,
        parsedName: values.originalName.toLowerCase().replace(/\s+/g, ""), 
        referenceValue: values.referenceValue,
        idUnit: values.unit?.id, 
      };

      const blodTestCreationPromise = addBlodTestMutation.mutateAsync(payload);
      toast.promise(blodTestCreationPromise, {
        loading: <LoadingToast message="Creando análisis bioquímico..." />,
        success: (
          <SuccessToast message="Análisis bioquímico creado con éxito!" />
        ),
        error: (
          <ErrorToast message="Hubo un error al crear el Análisis Bioquímico." />
        ),
      });
      blodTestCreationPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear el análisis bioquímico", error);
        });
    } catch (error) {
      console.error("Error al crear el análisis bioquímico", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Análisis Bioquímico</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="originalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black capitalize">
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Glucosa"
                      className="capitalize"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({}) => (
                <FormItem>
                  <FormLabel className="text-black capitalize">
                    Unidad
                  </FormLabel>
                  <FormControl>
                    <UnitSelect control={form.control} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Valor de Referencia */}
            <FormField
              control={form.control}
              name="referenceValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black capitalize">
                    Valor de Referencia
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="70-110"
                      className="capitalize"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex items-center justify-between mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
                className="capitalize"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className=" bg-greenPrimary hover:bg-greenPrimary text-white font-bold py-2 px-4 rounded-md transition duration-300 capitalize"
                variant="default"
                disabled={addBlodTestMutation.isPending}
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
