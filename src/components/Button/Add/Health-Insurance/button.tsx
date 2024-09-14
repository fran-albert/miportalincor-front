import React from "react";
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
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { useHealthInsuranceMutations } from "@/hooks/Health-Insurance/useHealthInsuranceMutation";

interface AddHealthInsuranceDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Inputs extends HealthInsurance {}

export default function AddHealthInsuranceDialog({
  isOpen,
  setIsOpen,
}: AddHealthInsuranceDialogProps) {
  const { addHealthInsuranceMutation } = useHealthInsuranceMutations();

  const toggleDialog = () => setIsOpen(!isOpen);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const hcCreationPromise = addHealthInsuranceMutation.mutateAsync(data);
      toast.promise(hcCreationPromise, {
        loading: "Creando Obra Social...",
        success: "Obra Social creada con éxito!",
        error: "Error al crear la Obra Social",
      });

      hcCreationPromise
        .then(() => {
          setIsOpen(false);
          reset();
        })
        .catch((error) => {
          console.error("Error al crear la Obra Social", error);
        });
    } catch (error) {
      console.error("Error al crear la Obra Social", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Obra Social</DialogTitle>
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
                  {errors.name && <span>Este campo es obligatorio</span>}
                </div>
              </div>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={toggleDialog}>
              Cancelar
            </Button>
            <Button variant="incor" type="submit">
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
