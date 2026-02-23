import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CreateAppointmentForm, GuestAppointmentData } from "../Forms/CreateAppointmentForm";
import { useAppointmentMutations, useCreateGuestAppointment } from "@/hooks/Appointments";
import { CreateAppointmentFormData } from "@/validators/Appointment/appointment.schema";
import { CalendarPlus, Loader2, UserPlus } from "lucide-react";
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
  /** If provided, fixes the doctor and disables doctor select */
  fixedDoctorId?: number;
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
  fixedDoctorId,
}: CreateAppointmentDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
        consultationTypeId: data.consultationTypeId,
      });
      showSuccess("Turno creado", "El turno se creó correctamente");
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || "No se pudo crear el turno";
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
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || "No se pudo crear el turno de invitado";
      showError("Error", errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) setIsGuestMode(false);
      setOpen(value);
    }}>
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Turno</DialogTitle>
          <DialogDescription>
            Complete los datos para agendar un nuevo turno
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)] pr-4">
          <CreateAppointmentForm
            formRef={formRef}
            onSubmit={handleSubmit}
            onGuestSubmit={allowGuestCreation ? handleGuestSubmit : undefined}
            isLoading={isCreating || isCreatingGuest}
            defaultDoctorId={fixedDoctorId ?? defaultDoctorId}
            defaultPatientId={defaultPatientId}
            defaultPatient={defaultPatient}
            defaultDate={defaultDate}
            defaultHour={defaultHour}
            allowGuestCreation={allowGuestCreation}
            fixedDoctorId={fixedDoctorId}
            hideSubmitButton
            onGuestModeChange={setIsGuestMode}
          />
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isCreating || isCreatingGuest}
            className={isGuestMode ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            {(isCreating || isCreatingGuest) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGuestMode && <UserPlus className="mr-2 h-4 w-4" />}
            {isGuestMode ? "Crear Turno Invitado" : "Crear Turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAppointmentDialog;
