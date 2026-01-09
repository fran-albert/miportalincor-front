import { useEffect } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { DoctorSelect } from "../Select/DoctorSelect";
import { PatientSelect } from "../Select/PatientSelect";
import { TimeSlotSelect } from "../Select/TimeSlotSelect";
import {
  CreateAppointmentSchema,
  CreateAppointmentFormData
} from "@/validators/Appointment/appointment.schema";
import { formatDateForCalendar, getTodayDateAR } from "@/common/helpers/timezone";
import { Loader2 } from "lucide-react";

interface CreateAppointmentFormProps {
  onSubmit: (data: CreateAppointmentFormData) => Promise<void>;
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
}

export const CreateAppointmentForm = ({
  onSubmit,
  isLoading = false,
  defaultDoctorId,
  defaultPatientId,
  defaultPatient,
  defaultDate
}: CreateAppointmentFormProps) => {
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
      hour: "",
    },
  });

  const watchDoctorId = form.watch("doctorId");
  const watchDate = form.watch("date");

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente *</FormLabel>
              <FormControl>
                <PatientSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Buscar paciente..."
                  defaultPatient={defaultPatient}
                  disabled={!!defaultPatient}
                />
              </FormControl>
              {!defaultPatient && <FormMessage />}
            </FormItem>
          )}
        />

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
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Turno
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateAppointmentForm;
