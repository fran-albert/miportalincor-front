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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useBlodTestMutations } from "@/hooks/Blod-Test/useBlodTestMutation";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { bloodTestSchema } from "@/validators/Blod-Test/blod-test.schema";
import { UnitSelect } from "@/components/Select/Unit/select";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  blodTest: BloodTest;
}

export default function EditBlodTestDialog({
  isOpen,
  setIsOpen,
  blodTest,
}: Props) {
  const { updateBlodTestMutation } = useBlodTestMutations();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof bloodTestSchema>>({
    resolver: zodResolver(bloodTestSchema),
    defaultValues: {
      name: blodTest.name,
      unit: blodTest.unit,
      referenceValue: blodTest.referenceValue,
    },
  });

  useEffect(() => {
    if (isOpen && blodTest) {
      form.reset({
        name: blodTest.name,
        unit: blodTest.unit,
        referenceValue: blodTest.referenceValue,
      });
    }
  }, [isOpen, blodTest]);

  async function onSubmit(values: z.infer<typeof bloodTestSchema>) {
    try {
      const specialityCreationPromise = updateBlodTestMutation.mutateAsync({
        id: Number(blodTest.id),
        blodTest: {
          id: Number(blodTest.id),
          name: values.name,
          idUnit: Number(values?.unit?.id),
          referenceValue: values.referenceValue,
        },
      });
      toast.promise(specialityCreationPromise, {
        loading: <LoadingToast message="Editando análisis bioquímico..." />,
        success: (
          <SuccessToast message="Análisis bioquímico editado con éxito!" />
        ),
        error: <ErrorToast message="Error al editar el análisis bioquímico" />,
      });
      specialityCreationPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al editar el análisis bioquímico", error);
        });
    } catch (error) {
      console.error("Error al editar el análisis bioquímico", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar {blodTest.name}</DialogTitle>
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
            <FormField
              control={form.control}
              name="unit"
              render={({}) => (
                <FormItem>
                  <FormLabel className="text-black capitalize">
                    Unidad
                  </FormLabel>
                  <FormControl>
                    <UnitSelect
                      control={form.control}
                      defaultValue={blodTest.unit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referenceValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black capitalize">
                    Rango de Referencia
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
