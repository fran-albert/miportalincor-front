import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { useHealthInsuranceMutations } from "@/hooks/Health-Insurance/useHealthInsuranceMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { healthInsuranceSchema } from "@/validators/health.insurance.schema";
interface EditHealthCareDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  healthInsurance: HealthInsurance;
}

export default function EditHealthInsuranceDialog({
  isOpen,
  setIsOpen,
  healthInsurance,
}: EditHealthCareDialogProps) {
  const { updateHealthInsuranceMutation } = useHealthInsuranceMutations();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof healthInsuranceSchema>>({
    resolver: zodResolver(healthInsuranceSchema),
    defaultValues: healthInsurance,
  });

  useEffect(() => {
    if (isOpen && healthInsurance) {
      form.reset(healthInsurance);
    }
  }, [isOpen, healthInsurance]);

  async function onSubmit(values: z.infer<typeof healthInsuranceSchema>) {
    try {
      const promise = updateHealthInsuranceMutation.mutateAsync({
        id: Number(healthInsurance.id),
        healthInsurance: values,
      });

      toast.promise(promise, {
        loading: <LoadingToast message="Editando obra social..." />,
        success: <SuccessToast message="Obra social editada con éxito!" />,
        error: <ErrorToast message="Error al editar la obra social" />,
      });
      promise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al editar la Obra Social", error);
        });
    } catch (error) {
      console.error("Error al editar la Obra Social", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Obra Social</DialogTitle>
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
                className=" bg-greenPrimary capitalize hover:bg-greenPrimary text-white font-bold py-2 px-4 rounded-md transition duration-300"
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
