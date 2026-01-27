import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CreateOverturnForm, GuestOverturnData } from "../Forms/CreateOverturnForm";
import { useOverturnMutations, useCreateGuestOverturn } from "@/hooks/Overturns";
import { CreateOverturnFormData } from "@/validators/Appointment/appointment.schema";
import { AlertCircle } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface CreateOverturnDialogProps {
  trigger?: React.ReactNode;
  defaultDoctorId?: number;
  defaultPatientId?: number;
  defaultDate?: string;
  onSuccess?: () => void;
  /** Controlled open state (optional) */
  open?: boolean;
  /** Callback when open state changes (optional) */
  onOpenChange?: (open: boolean) => void;
  /** If true, allow creating guest overturns */
  allowGuestCreation?: boolean;
}

export const CreateOverturnDialog = ({
  trigger,
  defaultDoctorId,
  defaultPatientId,
  defaultDate,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  allowGuestCreation = true,
}: CreateOverturnDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { showSuccess, showError } = useToastContext();
  const { createOverturn, isCreating } = useOverturnMutations();
  const { createGuestOverturn, isCreating: isCreatingGuest } = useCreateGuestOverturn();

  const handleSubmit = async (data: CreateOverturnFormData) => {
    try {
      await createOverturn.mutateAsync({
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: data.date,
        hour: data.hour,
        reason: data.reason,
      });
      showSuccess("Sobreturno creado", "El sobreturno se creo correctamente");
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el sobreturno";
      showError("Error", errorMessage);
    }
  };

  const handleGuestSubmit = async (data: GuestOverturnData) => {
    try {
      await createGuestOverturn.mutateAsync({
        doctorId: data.doctorId,
        date: data.date,
        hour: data.hour,
        reason: data.reason,
        guestDocumentNumber: data.guestDocumentNumber,
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail,
      });
      showSuccess("Sobreturno de invitado creado", "El sobreturno se creo correctamente para el paciente invitado");
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el sobreturno de invitado";
      showError("Error", errorMessage);
    }
  };

  // If controlled externally (no trigger), render dialog without trigger
  if (controlledOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Crear Sobreturno
            </DialogTitle>
            <DialogDescription>
              Los sobreturnos se agregan fuera de la agenda regular del medico
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <CreateOverturnForm
              onSubmit={handleSubmit}
              onGuestSubmit={allowGuestCreation ? handleGuestSubmit : undefined}
              isLoading={isCreating || isCreatingGuest}
              defaultDoctorId={defaultDoctorId}
              defaultPatientId={defaultPatientId}
              defaultDate={defaultDate}
              allowGuestCreation={allowGuestCreation}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
            <AlertCircle className="mr-2 h-4 w-4" />
            Sobreturno
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Crear Sobreturno
          </DialogTitle>
          <DialogDescription>
            Los sobreturnos se agregan fuera de la agenda regular del medico
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <CreateOverturnForm
            onSubmit={handleSubmit}
            onGuestSubmit={allowGuestCreation ? handleGuestSubmit : undefined}
            isLoading={isCreating || isCreatingGuest}
            defaultDoctorId={defaultDoctorId}
            defaultPatientId={defaultPatientId}
            defaultDate={defaultDate}
            allowGuestCreation={allowGuestCreation}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOverturnDialog;
