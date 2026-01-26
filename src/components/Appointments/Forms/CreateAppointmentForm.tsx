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
import { DatePicker } from "@/components/ui/date-picker";
import { DoctorSelect } from "../Select/DoctorSelect";
import { PatientSelectWithGuestOption, GuestData } from "../Select/PatientSelectWithGuestOption";
import { TimeSlotSelect } from "../Select/TimeSlotSelect";
import {
  CreateAppointmentSchema,
  CreateAppointmentFormData
} from "@/validators/Appointment/appointment.schema";
import { formatDateForCalendar, getTodayDateAR } from "@/common/helpers/timezone";
import { Loader2, UserPlus, X } from "lucide-react";

export interface GuestAppointmentData {
  doctorId: number;
  date: string;
  hour: string;
  guestDocumentNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestEmail?: string;
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
}: CreateAppointmentFormProps) => {
  const [guestData, setGuestData] = useState<GuestData | null>(null);

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
    },
  });

  const watchDoctorId = form.watch("doctorId");
  const watchDate = form.watch("date");
  const watchHour = form.watch("hour");

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

  const handleSubmit = async (data: CreateAppointmentFormData) => {
    await onSubmit(data);
  };

  const handleGuestSelect = (data: GuestData) => {
    setGuestData(data);
    // Clear patient selection when switching to guest mode
    form.setValue("patientId", undefined as unknown as number);
  };

  const handleClearGuest = () => {
    setGuestData(null);
  };

  const handleGuestSubmit = async () => {
    if (!guestData || !onGuestSubmit) return;

    const doctorId = form.getValues("doctorId");
    const date = form.getValues("date");
    const hour = form.getValues("hour");

    if (!doctorId || !date || !hour) {
      return;
    }

    await onGuestSubmit({
      doctorId,
      date,
      hour,
      guestDocumentNumber: guestData.documentNumber,
      guestFirstName: guestData.firstName,
      guestLastName: guestData.lastName,
      guestPhone: guestData.phone,
      guestEmail: guestData.email,
    });
  };

  const isGuestMode = guestData !== null;
  const canSubmitGuest = isGuestMode && watchDoctorId && watchDate && watchHour;

  return (
    <Form {...form}>
      <form onSubmit={isGuestMode ? (e) => { e.preventDefault(); handleGuestSubmit(); } : form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico *</FormLabel>
              <FormControl>
                <DoctorSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Seleccionar médico"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Patient/Guest Selection */}
        {isGuestMode ? (
          <div className="space-y-2">
            <FormLabel>Paciente (Invitado)</FormLabel>
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-purple-900">
                  {guestData.firstName} {guestData.lastName}
                </p>
                <p className="text-sm text-purple-700">
                  DNI: {guestData.documentNumber} | Tel: {guestData.phone}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                INVITADO
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearGuest}
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
              >
                <X className="h-4 w-4" />
              </Button>
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
                    onGuestSelect={handleGuestSelect}
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
          name="hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario *</FormLabel>
              <FormControl>
                <TimeSlotSelect
                  doctorId={watchDoctorId}
                  date={watchDate}
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
      </form>
    </Form>
  );
};

export default CreateAppointmentForm;
