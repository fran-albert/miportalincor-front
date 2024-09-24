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
import { Speciality } from "@/types/Speciality/Speciality";
import { useSpecialityMutations } from "@/hooks/Speciality/useHealthInsuranceMutation";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { specialitySchema } from "@/validators/speciality.schema";
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

interface EditSpecialityDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  speciality: Speciality;
}

export default function EditSpecialityDialog({
  isOpen,
  setIsOpen,
  speciality,
}: EditSpecialityDialogProps) {
  const { updateSpecialityMutation } = useSpecialityMutations();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof specialitySchema>>({
    resolver: zodResolver(specialitySchema),
    defaultValues: speciality,
  });

  useEffect(() => {
    if (isOpen && speciality) {
      form.reset(speciality);
    }
  }, [isOpen, speciality]);

  async function onSubmit(values: z.infer<typeof specialitySchema>) {
    try {
      const specialityCreationPromise = updateSpecialityMutation.mutateAsync({
        id: Number(speciality.id),
        speciality: {
          id: Number(speciality.id),
          name: values.name,
        },
      });
      toast.promise(specialityCreationPromise, {
        loading: <LoadingToast message="Editando especialidad..." />,
        success: <SuccessToast message="Especialidad editada con éxito!" />,
        error: <ErrorToast message="Error al editar la Especialidad" />,
      });
      specialityCreationPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al editar la Especialidad", error);
        });
    } catch (error) {
      console.error("Error al editar la Especialidad", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar {speciality.name}</DialogTitle>
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
