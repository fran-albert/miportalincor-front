import React, { useEffect } from "react";
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
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useBlodTestMutations } from "@/hooks/Blod-Test/useBlodTestMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
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
import { ApiError } from "@/types/Error/ApiError";

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
  const { promiseToast } = useToastContext();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof bloodTestSchema>>({
    resolver: zodResolver(bloodTestSchema),
    defaultValues: {
      originalName: blodTest.originalName,
      unit: blodTest.unit,
      referenceValue: blodTest.referenceValue,
    },
  });

  useEffect(() => {
    if (isOpen && blodTest) {
      form.reset({
        originalName: blodTest.originalName,
        unit: blodTest.unit,
        referenceValue: blodTest.referenceValue,
      });
    }
  }, [isOpen, blodTest, form]);

  async function onSubmit(values: z.infer<typeof bloodTestSchema>) {
    try {
      const promise = updateBlodTestMutation.mutateAsync({
        id: Number(blodTest.id),
        blodTest: {
          id: Number(blodTest.id),
          originalName: values.originalName,
          idUnit: Number(values?.unit?.id),
          referenceValue: values.referenceValue,
          ParsedName: values.originalName.toLowerCase().replace(/\s+/g, ""),
        },
      });

      await promiseToast(promise, {
        loading: {
          title: "Editando análisis bioquímico...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Análisis bioquímico editado!",
          description: "El análisis bioquímico se ha editado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al editar análisis bioquímico",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al editar el análisis bioquímico", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar {blodTest.originalName}</DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={() => (
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
                disabled={updateBlodTestMutation.isPending}
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
