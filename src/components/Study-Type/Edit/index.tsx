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
import { StudyType } from "@/types/Study-Type/Study-Type";
import { useStudyTypeMutations } from "@/hooks/Study-Type/useStudyTypeMutations";
import { studyTypeSchema } from "@/validators/Study-Type/study-type.schema";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  studyType: StudyType;
}

export default function EditStudyTypeDialog({
  isOpen,
  setIsOpen,
  studyType,
}: Props) {
  const { updateStudyTypeMutation } = useStudyTypeMutations();
  const { promiseToast } = useToastContext();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof studyTypeSchema>>({
    resolver: zodResolver(studyTypeSchema),
    defaultValues: {
      name: studyType.name,
      id: Number(studyType.id),
    },
  });

  useEffect(() => {
    if (isOpen && studyType) {
      form.reset({
        name: studyType.name,
        id: Number(studyType.id),
      });
    }
  }, [isOpen, studyType, form]);

  async function onSubmit(values: z.infer<typeof studyTypeSchema>) {
    try {
      const studyTypeCreationPromise = updateStudyTypeMutation.mutateAsync({
        id: Number(studyType.id),
        studyType: {
          id: Number(studyType.id),
          name: values.name,
        },
      });
      await promiseToast(studyTypeCreationPromise, {
        loading: {
          title: "Editando tipo de estudio...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Tipo de estudio editado!",
          description: "El tipo de estudio se ha editado exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al editar tipo de estudio",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al editar el Tipo de Estudio", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar {studyType.name}</DialogTitle>
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
                type="button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className=" bg-greenPrimary capitalize hover:bg-greenPrimary text-white font-bold py-2 px-4 rounded-md transition duration-300"
                variant="default"
                disabled={updateStudyTypeMutation.isPending}
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
