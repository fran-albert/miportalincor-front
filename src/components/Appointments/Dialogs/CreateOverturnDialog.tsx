import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateOverturnForm } from "../Forms/CreateOverturnForm";
import { useOverturnMutations } from "@/hooks/Overturns";
import { CreateOverturnFormData } from "@/validators/Appointment/appointment.schema";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateOverturnDialogProps {
  trigger?: React.ReactNode;
  defaultDoctorId?: number;
  defaultPatientId?: number;
  defaultDate?: string;
  onSuccess?: () => void;
}

export const CreateOverturnDialog = ({
  trigger,
  defaultDoctorId,
  defaultPatientId,
  defaultDate,
  onSuccess
}: CreateOverturnDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createOverturn, isCreating } = useOverturnMutations();

  const handleSubmit = async (data: CreateOverturnFormData) => {
    try {
      await createOverturn.mutateAsync({
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: data.date,
        hour: data.hour,
        reason: data.reason,
      });
      toast({
        title: "Sobreturno creado",
        description: "El sobreturno se creó correctamente",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el sobreturno";
      toast({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
            <AlertCircle className="mr-2 h-4 w-4" />
            Sobreturno
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Crear Sobreturno
          </DialogTitle>
          <DialogDescription>
            Los sobreturnos se agregan fuera de la agenda regular del médico
          </DialogDescription>
        </DialogHeader>
        <CreateOverturnForm
          onSubmit={handleSubmit}
          isLoading={isCreating}
          defaultDoctorId={defaultDoctorId}
          defaultPatientId={defaultPatientId}
          defaultDate={defaultDate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateOverturnDialog;
