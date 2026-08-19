import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AppointmentCreatePreviewMeta,
  CreateAppointmentForm,
  GuestAppointmentData,
} from "../Forms/CreateAppointmentForm";
import {
  useAppointmentMutations,
  useCreateGuestAppointment,
  useCreateStaffIntegralAppointment,
  useIntegralCheckupConfig,
} from "@/hooks/Appointments";
import { StaffIntegralCheckupForm } from "../Forms/StaffIntegralCheckupForm";
import { CreateAppointmentFormData } from "@/validators/Appointment/appointment.schema";
import { CalendarPlus, HeartPulse, Loader2, UserPlus } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";
import { INTEGRAL_CHECKUP_LABEL } from "@/common/constants/integral-checkup";
import { doctorOffersIntegralCheckup } from "@/common/helpers/integral-checkup-offer";
import useUserRole from "@/hooks/useRoles";
import { cn } from "@/lib/utils";

/**
 * Los dos altas que conviven en este diálogo.
 *
 * 🔴 Son dos entradas de UI sobre **un solo camino de alta en el backend**: el
 * control lo crea el mismo servicio que usa el portal de la paciente. Lo que
 * este pliego no tolera es que el control se pueda crear de dos maneras
 * distintas; dos formularios que llaman al mismo alta está bien.
 */
type Modality = "standard" | "integral";

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
  onAppointmentCreated?: (appointment: AppointmentFullResponseDto) => void;
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
  onAppointmentCreated,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  allowGuestCreation = true,
  fixedDoctorId,
}: CreateAppointmentDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [modality, setModality] = useState<Modality>("standard");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(
    fixedDoctorId ?? defaultDoctorId,
  );
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [canSubmitGuest, setCanSubmitGuest] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const handleCanSubmitGuestChange = useCallback((canSubmit: boolean) => {
    setCanSubmitGuest(canSubmit);
  }, []);

  // Usar estado controlado si se provee, sino usar interno
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  const { showSuccess, showError } = useToastContext();
  const { createAppointment, isCreating } = useAppointmentMutations();
  const { createGuestAppointment, isCreating: isCreatingGuest } = useCreateGuestAppointment();
  const createIntegral = useCreateStaffIntegralAppointment();
  // El control lo da secretaría (o administración). Un médico da sus turnos,
  // no el control de otras dos agendas.
  const { isSecretary, isAdmin } = useUserRole();
  const isStaff = isSecretary || isAdmin;

  /**
   * 🔴 Quién ofrece el control lo dice el BACKEND. Acá no hay ningún id de
   * médica: la ginecóloga del control es config de instancia y se pregunta.
   * Por eso la modalidad aparece recién después de elegir el médico —el
   * recorrido que pidió Francisco el 19/08— y con cualquier otro médico el
   * alta común queda exactamente como estaba.
   */
  const { config: integralConfig, isError: integralConfigError } =
    useIntegralCheckupConfig({
      enabled: isStaff,
    });
  const offersIntegralCheckup =
    isStaff && doctorOffersIntegralCheckup(integralConfig, selectedDoctorId);
  const isIntegral = offersIntegralCheckup && modality === "integral";

  // Cambiar a un médico que no ofrece el control tiene que devolver el alta
  // común: quedarse en el recorrido del control con otro médico elegido sería
  // dar un control en la agenda equivocada.
  useEffect(() => {
    if (!offersIntegralCheckup) {
      setModality("standard");
    }
  }, [offersIntegralCheckup]);

  /**
   * 🔴 El diálogo cerrado vuelve al alta de siempre, **se cierre como se
   * cierre**. El reset vivía en el `onOpenChange` de Radix y los tres cierres
   * que dispara este mismo diálogo cuando el alta sale bien no pasan por ahí:
   * dar un control desde la agenda de la ginecóloga dejaba la pantalla
   * abriendo directo en el control la próxima vez. Es el patrón que ya usa
   * `RequestAppointmentDialog` en el portal.
   */
  useEffect(() => {
    if (!open) {
      setIsGuestMode(false);
      setModality("standard");
    }
  }, [open]);

  const handleIntegralSubmit = async (data: {
    patientId: number;
    date: string;
  }) => {
    try {
      await createIntegral.mutateAsync(data);
      showSuccess(
        "Control reservado",
        "Se crearon la consulta y la ecografía, vinculadas.",
      );
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      showError(
        "Error",
        axiosError.response?.data?.message || "No se pudo dar el control",
      );
    }
  };

  const handleSubmit = async (
    data: CreateAppointmentFormData,
    previewMeta: AppointmentCreatePreviewMeta
  ) => {
    try {
      const consultationTypeIds = data.consultationTypeIds ?? [];
      const createdAppointment = await createAppointment.mutateAsync({
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: data.date,
        hour: data.hour,
        consultationTypeId: consultationTypeIds[0],
        consultationTypeIds,
      });
      onAppointmentCreated?.({
        ...createdAppointment,
        patient: previewMeta.patient,
        doctor: previewMeta.doctor,
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

  const handleGuestSubmit = async (
    data: GuestAppointmentData,
    previewMeta: AppointmentCreatePreviewMeta
  ) => {
    try {
      const createdAppointment = await createGuestAppointment.mutateAsync({
        doctorId: data.doctorId,
        date: data.date,
        hour: data.hour,
        guestDocumentNumber: data.guestDocumentNumber,
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail,
        consultationTypeId: data.consultationTypeId,
        consultationTypeIds: data.consultationTypeIds,
      });
      onAppointmentCreated?.({
        ...createdAppointment,
        isGuest: true,
        guestDocumentNumber: previewMeta.guestDocumentNumber,
        guestFirstName: previewMeta.guestFirstName,
        guestLastName: previewMeta.guestLastName,
        guestPhone: previewMeta.guestPhone,
        guestEmail: previewMeta.guestEmail,
        doctor: previewMeta.doctor,
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

  /**
   * 🔴 "No lo ofrece" y "no pude preguntarlo" no son lo mismo. Si
   * `/integral/config` falla, `config` queda `undefined` y la modalidad no
   * aparece: sin este aviso, un 500 se lee igual que "esta clínica no ofrece
   * el control". Se muestra recién con un médico elegido —antes no hay nada
   * que decir— y no bloquea nada: el turno común se da igual.
   */
  const showIntegralConfigError =
    isStaff && integralConfigError && !!selectedDoctorId;

  /**
   * Las dos modalidades, chiquitas, justo debajo del médico. Aparecen solo
   * cuando el médico elegido ofrece el control: con cualquier otro, esta
   * pantalla es la de siempre (o el aviso de arriba, si no se pudo preguntar).
   */
  const modalitySwitch = offersIntegralCheckup ? (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        aria-pressed={modality === "standard"}
        onClick={() => setModality("standard")}
        className={cn(
          "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
          modality === "standard"
            ? "border-greenPrimary bg-greenPrimary/5 text-greenPrimary"
            : "text-muted-foreground hover:bg-muted/50",
        )}
      >
        Turno común
      </button>
      <button
        type="button"
        aria-pressed={modality === "integral"}
        onClick={() => setModality("integral")}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
          modality === "integral"
            ? "border-pink-500 bg-pink-50 text-pink-900"
            : "text-muted-foreground hover:bg-muted/50",
        )}
      >
        <HeartPulse className="h-4 w-4 shrink-0 text-pink-600" />
        {INTEGRAL_CHECKUP_LABEL}
      </button>
    </div>
  ) : showIntegralConfigError ? (
    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      No pudimos consultar si este médico ofrece el{" "}
      {INTEGRAL_CHECKUP_LABEL.toLowerCase()}. El turno común se puede dar
      igual; para el control, volvé a abrir esta ventana en un rato.
    </p>
  ) : null;

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Turno</DialogTitle>
          <DialogDescription>
            Complete los datos para agendar un nuevo turno
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto pr-4">
          {/* El alta de turnos es UNA: el médico y la modalidad son los mismos
              para los dos recorridos, y lo que cambia es lo que va debajo. */}
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
            onCanSubmitGuestChange={handleCanSubmitGuestChange}
            onDoctorChange={setSelectedDoctorId}
            afterDoctorField={modalitySwitch}
            fieldsBelowDoctorOverride={
              isIntegral ? (
                <StaffIntegralCheckupForm
                  onSubmit={handleIntegralSubmit}
                  isLoading={createIntegral.isPending}
                  defaultPatient={defaultPatient}
                />
              ) : undefined
            }
          />
        </div>
        {/* El control trae su propio botón: lo que confirma no es un turno
            sino dos, y el texto lo tiene que decir. */}
        {!isIntegral && (
          <DialogFooter>
            <Button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isCreating || isCreatingGuest || (isGuestMode && !canSubmitGuest)}
              className={isGuestMode ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {(isCreating || isCreatingGuest) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGuestMode && <UserPlus className="mr-2 h-4 w-4" />}
              {isGuestMode ? "Crear Turno Invitado" : "Crear Turno"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateAppointmentDialog;
