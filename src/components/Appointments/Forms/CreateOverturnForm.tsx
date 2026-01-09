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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { DoctorSelect } from "../Select/DoctorSelect";
import { PatientSelect } from "../Select/PatientSelect";
import {
  CreateOverturnSchema,
  CreateOverturnFormData
} from "@/validators/Appointment/appointment.schema";
import { formatDateForCalendar, getTodayDateAR } from "@/common/helpers/timezone";
import { Loader2 } from "lucide-react";

interface CreateOverturnFormProps {
  onSubmit: (data: CreateOverturnFormData) => Promise<void>;
  isLoading?: boolean;
  defaultDoctorId?: number;
  defaultPatientId?: number;
  defaultDate?: string;
}

export const CreateOverturnForm = ({
  onSubmit,
  isLoading = false,
  defaultDoctorId,
  defaultPatientId,
  defaultDate
}: CreateOverturnFormProps) => {
  const form = useForm<CreateOverturnFormData>({
    resolver: zodResolver(CreateOverturnSchema),
    mode: "onSubmit",
    defaultValues: {
      doctorId: defaultDoctorId && defaultDoctorId > 0 ? defaultDoctorId : undefined,
      patientId: defaultPatientId && defaultPatientId > 0 ? defaultPatientId : undefined,
      date: defaultDate || getTodayDateAR(),
      hour: "",
      reason: "",
    },
  });

  const handleSubmit = async (data: CreateOverturnFormData) => {
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
                />
              </FormControl>
              <FormMessage />
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
                <Input
                  type="time"
                  {...field}
                  placeholder="HH:MM"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo del sobreturno</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ej: Paciente con urgencia, control post-operatorio..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Sobreturno
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateOverturnForm;
