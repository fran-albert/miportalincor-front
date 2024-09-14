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
import { useSpecialityMutations } from "@/hooks/Speciality/useHealthInsuranceMutation";

interface AddSpecialityDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Inputs extends Speciality {}

export default function AddSpecialityDialog({
  isOpen,
  setIsOpen,
}: AddSpecialityDialogProps) {
  const { addSpecialityMutation } = useSpecialityMutations();
  const toggleDialog = () => setIsOpen(!isOpen);
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const specialityCreationPromise = addSpecialityMutation.mutateAsync(data);
      toast.promise(specialityCreationPromise, {
        loading: "Creando especialidad...",
        success: "Especialidad creada con éxito!",
        error: "Error al crear la Especialidad",
      });
      specialityCreationPromise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear la Especialidad", error);
        });
    } catch (error) {
      console.error("Error al crear la Especialidad", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Especialidad</DialogTitle>
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
            <Button
              variant="incor"
              type="submit"
              disabled={addSpecialityMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
