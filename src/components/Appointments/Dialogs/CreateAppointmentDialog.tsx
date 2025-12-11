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
import { CreateAppointmentForm } from "../Forms/CreateAppointmentForm";
import { useAppointmentMutations } from "@/hooks/Appointments";
import { CreateAppointmentFormData } from "@/validators/Appointment/appointment.schema";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateAppointmentDialogProps {
  trigger?: React.ReactNode;
  defaultDoctorId?: number;
  defaultPatientId?: number;
  defaultDate?: string;
  onSuccess?: () => void;
}

export const CreateAppointmentDialog = ({
  trigger,
  defaultDoctorId,
  defaultPatientId,
  defaultDate,
  onSuccess
}: CreateAppointmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createAppointment, isCreating } = useAppointmentMutations();

  const handleSubmit = async (data: CreateAppointmentFormData) => {
    try {
      await createAppointment.mutateAsync({
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: data.date,
        hour: data.hour,
      });
      toast({
        title: "Turno creado",
        description: "El turno se creó correctamente",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el turno";
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
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nuevo Turno
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Turno</DialogTitle>
          <DialogDescription>
            Complete los datos para agendar un nuevo turno
          </DialogDescription>
        </DialogHeader>
        <CreateAppointmentForm
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

export default CreateAppointmentDialog;
