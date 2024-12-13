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
  }, [isOpen, studyType]);

  async function onSubmit(values: z.infer<typeof studyTypeSchema>) {
    try {
      const studyTypeCreationPromise = updateStudyTypeMutation.mutateAsync({
        id: Number(studyType.id),
        studyType: {
          id: Number(studyType.id),
          name: values.name,
        },
      });
      toast.promise(studyTypeCreationPromise, {
        loading: <LoadingToast message="Editando tipo de estudio..." />,
        success: <SuccessToast message="Tipo de estudio editado con éxito!" />,
        error: <ErrorToast message="Error al editar el Tipo de Estudio" />,
      });
      studyTypeCreationPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al editar el Tipo de Estudio", error);
        });
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
