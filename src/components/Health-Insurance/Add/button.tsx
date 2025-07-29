import React from "react";
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { useHealthInsuranceMutations } from "@/hooks/Health-Insurance/useHealthInsuranceMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { healthInsuranceSchema } from "@/validators/health.insurance.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface AddHealthInsuranceDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddHealthInsuranceDialog({
  isOpen,
  setIsOpen,
}: AddHealthInsuranceDialogProps) {
  const { addHealthInsuranceMutation } = useHealthInsuranceMutations();
  const { promiseToast } = useToastContext();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof healthInsuranceSchema>>({
    resolver: zodResolver(healthInsuranceSchema),
  });

  async function onSubmit(values: z.infer<typeof healthInsuranceSchema>) {
    try {
      const promise = addHealthInsuranceMutation.mutateAsync(values);

      await promiseToast(promise, {
        loading: {
          title: "Creando obra social...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Obra social creada!",
          description: "La obra social se ha creado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al crear obra social",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error al crear la Obra Social", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Obra Social</DialogTitle>
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
