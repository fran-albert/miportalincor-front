import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { DoctorSelect } from "../Select/DoctorSelect";
import { PatientSelectWithGuestOption } from "../Select/PatientSelectWithGuestOption";
import { TimeSlotSelect } from "../Select/TimeSlotSelect";
import { ConsultationTypeSelect } from "../Select/ConsultationTypeSelect";
import {
  CreateAppointmentSchema,
  CreateAppointmentFormData
} from "@/validators/Appointment/appointment.schema";
import { formatDateForCalendar, getTodayDateAR } from "@/common/helpers/timezone";
import { Loader2, UserPlus, X, Stethoscope } from "lucide-react";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { formatDoctorName } from "@/common/helpers/helpers";

export interface GuestAppointmentData {
  doctorId: number;
  date: string;
  hour: string;
  guestDocumentNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestEmail?: string;
  consultationTypeId?: number;
}

interface CreateAppointmentFormProps {
  onSubmit: (data: CreateAppointmentFormData) => Promise<void>;
  /** Called when creating a guest appointment */
  onGuestSubmit?: (data: GuestAppointmentData) => Promise<void>;
  isLoading?: boolean;
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
  /** If true, allow creating guest appointments */
  allowGuestCreation?: boolean;
  /** If provided, fixes the doctor and disables doctor select */
  fixedDoctorId?: number;
  /** Ref to the form element for external submit */
  formRef?: React.Ref<HTMLFormElement>;
  /** If true, hides the internal submit button (rendered externally) */
  hideSubmitButton?: boolean;
  /** Callback when guest mode changes */
  onGuestModeChange?: (isGuest: boolean) => void;
  /** Callback when guest submit availability changes */
  onCanSubmitGuestChange?: (canSubmit: boolean) => void;
}

export const CreateAppointmentForm = ({
  onSubmit,
  onGuestSubmit,
  isLoading = false,
  defaultDoctorId,
  defaultPatientId,
  defaultPatient,
  defaultDate,
  defaultHour,
  allowGuestCreation = true,
  fixedDoctorId,
  formRef,
  hideSubmitButton = false,
  onGuestModeChange,
  onCanSubmitGuestChange,
}: CreateAppointmentFormProps) => {
  const [guestDni, setGuestDni] = useState<string | null>(null);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const { doctors } = useDoctors({ auth: true, fetchDoctors: !!fixedDoctorId });
  const fixedDoctor = fixedDoctorId
    ? doctors.find(d => Number(d.userId) === fixedDoctorId)
    : undefined;

  // Determinar el patientId inicial: usar defaultPatientId o el userId del defaultPatient
  const initialPatientId = defaultPatientId && defaultPatientId > 0
    ? defaultPatientId
    : (defaultPatient?.userId && defaultPatient.userId > 0 ? defaultPatient.userId : undefined);

  const form = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(CreateAppointmentSchema),
    mode: "onSubmit",
    defaultValues: {
      doctorId: defaultDoctorId && defaultDoctorId > 0 ? defaultDoctorId : undefined,
      patientId: initialPatientId,
      date: defaultDate || getTodayDateAR(),
      hour: defaultHour || "",
      consultationTypeId: undefined,
    },
  });

  const watchDoctorId = form.watch("doctorId");
  const watchDate = form.watch("date");
  const watchHour = form.watch("hour");
  const watchConsultationTypeId = form.watch("consultationTypeId");

  // Setear el patientId cuando hay un defaultPatient (fix para react-hook-form)
  useEffect(() => {
    const patientIdFromDefault = defaultPatient?.userId ? Number(defaultPatient.userId) : 0;
    const patientIdFromProp = defaultPatientId ? Number(defaultPatientId) : 0;
    const finalPatientId = patientIdFromDefault > 0 ? patientIdFromDefault : patientIdFromProp;

    if (finalPatientId > 0) {
      // Usar reset para setear todos los valores correctamente
      form.reset({
        ...form.getValues(),
        patientId: finalPatientId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPatient?.userId, defaultPatientId]);

  // Hour auto-clear is handled by TimeSlotSelect when slots change

  const handleSubmit = async (data: CreateAppointmentFormData) => {
    await onSubmit(data);
  };

  const handleCreateGuestClick = (documentNumber: string) => {
    setGuestDni(documentNumber);
    setGuestFirstName("");
    setGuestLastName("");
    setGuestPhone("");
    setGuestEmail("");
    onGuestModeChange?.(true);
    form.setValue("patientId", undefined as unknown as number);
  };

  const handleClearGuest = () => {
    setGuestDni(null);
    setGuestFirstName("");
    setGuestLastName("");
    setGuestPhone("");
    setGuestEmail("");
    onGuestModeChange?.(false);
  };

  const handleGuestSubmit = async () => {
    if (!guestDni || !onGuestSubmit) return;
    if (!guestFirstName || !guestLastName || !guestPhone) return;

    const doctorId = form.getValues("doctorId");
    const date = form.getValues("date");
    const hour = form.getValues("hour");
    const consultationTypeId = form.getValues("consultationTypeId");

    if (!doctorId || !date || !hour) return;

    await onGuestSubmit({
      doctorId,
      date,
      hour,
      guestDocumentNumber: guestDni,
      guestFirstName,
      guestLastName,
      guestPhone,
      guestEmail: guestEmail || undefined,
      consultationTypeId,
    });
  };

  const isGuestMode = guestDni !== null;
  const canSubmitGuest = isGuestMode && !!guestFirstName && !!guestLastName && !!guestPhone && !!watchDoctorId && !!watchDate && !!watchHour;

  useEffect(() => {
    onCanSubmitGuestChange?.(canSubmitGuest);
  }, [canSubmitGuest, onCanSubmitGuestChange]);

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={isGuestMode ? (e) => { e.preventDefault(); handleGuestSubmit(); } : form.handleSubmit(handleSubmit)} className="space-y-4">
        {fixedDoctorId ? (
          <div className="space-y-2">
            <FormLabel>Medico</FormLabel>
            <div className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-muted px-3 py-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {fixedDoctor ? formatDoctorName(fixedDoctor) : "Cargando..."}
              </span>
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medico *</FormLabel>
                <FormControl>
                  <DoctorSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleccionar medico"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Patient/Guest Selection */}
        {isGuestMode ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Paciente (Invitado)</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearGuest}
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 h-7 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
              <UserPlus className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">DNI: {guestDni}</span>
              <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                INVITADO
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="guestFirstName" className="text-sm">Nombre *</Label>
                <Input
                  id="guestFirstName"
                  placeholder="Nombre"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guestLastName" className="text-sm">Apellido *</Label>
                <Input
                  id="guestLastName"
                  placeholder="Apellido"
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="guestPhone" className="text-sm">Telefono *</Label>
                <Input
                  id="guestPhone"
                  placeholder="Telefono"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guestEmail" className="text-sm">Email (opcional)</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente *</FormLabel>
                <FormControl>
                  <PatientSelectWithGuestOption
                    value={field.value}
                    onValueChange={field.onChange}
                    onCreateGuestClick={handleCreateGuestClick}
                    placeholder="Buscar paciente por DNI..."
                    defaultPatient={defaultPatient}
                    disabled={!!defaultPatient}
                    allowGuestCreation={allowGuestCreation && !!onGuestSubmit}
                  />
                </FormControl>
                {!defaultPatient && <FormMessage />}
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha *</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                  onChange={(date: Date | undefined) => {
                    if (date) {
                      field.onChange(formatDateForCalendar(date));
                      // Reset hour when date changes
                      form.setValue("hour", "");
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consultationTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Consulta</FormLabel>
              <FormControl>
                <ConsultationTypeSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Seleccionar tipo (opcional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario *</FormLabel>
              <FormControl>
                <TimeSlotSelect
                  doctorId={watchDoctorId}
                  date={watchDate}
                  consultationTypeId={watchConsultationTypeId}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Seleccionar horario"
                  disabled={!watchDoctorId || !watchDate}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideSubmitButton && (
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || (isGuestMode && !canSubmitGuest)}
              className={isGuestMode ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGuestMode && <UserPlus className="mr-2 h-4 w-4" />}
              {isGuestMode ? "Crear Turno Invitado" : "Crear Turno"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default CreateAppointmentForm;
