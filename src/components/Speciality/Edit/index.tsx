import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { Speciality } from "@/types/Speciality/Speciality";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { FaPencil } from "react-icons/fa6";
import ActionIcon from "@/components/Icons/action";
import { useSpecialityMutations } from "@/hooks/Speciality/useHealthInsuranceMutation";

interface EditSpecialityDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  speciality: Speciality;
}

interface Inputs extends Speciality {}

export default function EditSpecialityDialog({
  isOpen,
  setIsOpen,
  speciality,
}: EditSpecialityDialogProps) {
  const { updateSpecialityMutation } = useSpecialityMutations();
  const toggleDialog = () => setIsOpen(!isOpen);
  const {
    register,
    handleSubmit,
    reset,
  } = useForm<Inputs>();

  useEffect(() => {
    if (isOpen && speciality) {
      reset(speciality);
    }
  }, [isOpen, speciality, reset]);

  const onSubmit: SubmitHandler<Inputs> = async (data: Speciality) => {
    try {
      const specialityCreationPromise = updateSpecialityMutation.mutateAsync({
        id: Number(speciality.id),
        speciality: data,
      });
      toast.promise(specialityCreationPromise, {
        loading: "Editando especialidad...",
        success: "Especialidad editada con éxito!",
        error: "Error al editar la Especialidad",
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger asChild>
        <Button variant="ghost" onClick={toggleDialog}>
          <ActionIcon
            icon={<FaPencil size={20} />}
            tooltip="Editar"
            color="text-gray-600"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Especialidad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogDescription>
            <div className="flex flex-row mt-2">
              <div className="flex-1 pr-1">
                <div className="mb-2 block ">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    {...register("name", { required: true })}
                    className="bg-gray-200 text-gray-700"
                  />
                </div>
              </div>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={toggleDialog}>
              Cancelar
            </Button>
            <Button variant="incor" type="submit"  disabled={updateSpecialityMutation.isPending}>
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
