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
import { CreateAppointmentForm, GuestAppointmentData } from "../Forms/CreateAppointmentForm";
import { useAppointmentMutations, useCreateGuestAppointment } from "@/hooks/Appointments";
import { CreateAppointmentFormData } from "@/validators/Appointment/appointment.schema";
import { CalendarPlus } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface CreateAppointmentDialogProps {
  trigger?: React.ReactNode;
  defaultDoctorId?: number;
  defaultPatientId?: number;
  defaultPatient?: {
    userId: number;
    firstName: string;
    lastName: string;
    userName?: string;
  };
  defaultDate?: string;
  defaultHour?: string;
  onSuccess?: () => void;
  /** Control externo del estado del dialog */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** If true, allow creating guest appointments */
  allowGuestCreation?: boolean;
}

export const CreateAppointmentDialog = ({
  trigger,
  defaultDoctorId,
  defaultPatientId,
  defaultPatient,
  defaultDate,
  defaultHour,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  allowGuestCreation = true,
}: CreateAppointmentDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Usar estado controlado si se provee, sino usar interno
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  const { showSuccess, showError } = useToastContext();
  const { createAppointment, isCreating } = useAppointmentMutations();
  const { createGuestAppointment, isCreating: isCreatingGuest } = useCreateGuestAppointment();

  const handleSubmit = async (data: CreateAppointmentFormData) => {
    try {
      await createAppointment.mutateAsync({
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: data.date,
        hour: data.hour,
      });
      showSuccess("Turno creado", "El turno se creó correctamente");
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el turno";
      showError("Error", errorMessage);
    }
  };

  const handleGuestSubmit = async (data: GuestAppointmentData) => {
    try {
      await createGuestAppointment.mutateAsync({
        doctorId: data.doctorId,
        date: data.date,
        hour: data.hour,
        guestDocumentNumber: data.guestDocumentNumber,
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail,
      });
      showSuccess("Turno de invitado creado", "El turno se creó correctamente para el paciente invitado");
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el turno de invitado";
      showError("Error", errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Solo mostrar trigger si no está en modo controlado */}
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nuevo Turno
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Turno</DialogTitle>
          <DialogDescription>
            Complete los datos para agendar un nuevo turno
          </DialogDescription>
        </DialogHeader>
        <CreateAppointmentForm
          onSubmit={handleSubmit}
          onGuestSubmit={allowGuestCreation ? handleGuestSubmit : undefined}
          isLoading={isCreating || isCreatingGuest}
          defaultDoctorId={defaultDoctorId}
          defaultPatientId={defaultPatientId}
          defaultPatient={defaultPatient}
          defaultDate={defaultDate}
          defaultHour={defaultHour}
          allowGuestCreation={allowGuestCreation}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateAppointmentDialog;
