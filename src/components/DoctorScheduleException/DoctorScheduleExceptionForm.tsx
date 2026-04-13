import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateDoctorScheduleExceptionFormData,
  CreateDoctorScheduleExceptionSchema,
} from "@/validators/DoctorScheduleException/doctor-schedule-exception.schema";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import {
  CreateDoctorScheduleExceptionDto,
  DoctorScheduleExceptionResponseDto,
  UpdateDoctorScheduleExceptionDto,
} from "@/types/DoctorScheduleException";

interface DoctorScheduleExceptionFormProps {
  doctorId: number;
  onSubmit: (
    data: CreateDoctorScheduleExceptionDto | UpdateDoctorScheduleExceptionDto,
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: DoctorScheduleExceptionResponseDto;
  submitLabel?: string;
}

const SLOT_DURATIONS = [
  { value: 15, label: "15 minutos" },
  { value: 20, label: "20 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
];

export const DoctorScheduleExceptionForm = ({
  doctorId,
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
  submitLabel,
}: DoctorScheduleExceptionFormProps) => {
  const isEditing = !!initialData;

  const form = useForm<CreateDoctorScheduleExceptionFormData>({
    resolver: zodResolver(CreateDoctorScheduleExceptionSchema),
    mode: "onSubmit",
    defaultValues: initialData
      ? {
          doctorId,
          date: initialData.date,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          slotDuration: initialData.slotDuration,
        }
      : {
          doctorId,
          date: "",
          startTime: "08:00",
          endTime: "12:00",
          slotDuration: 30,
        },
  });

  const handleSubmit = async (data: CreateDoctorScheduleExceptionFormData) => {
    await onSubmit({
      doctorId: data.doctorId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDuration: data.slotDuration,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Override puntual del día</AlertTitle>
          <AlertDescription>
            Para esta fecha se reemplaza el horario habitual del médico. Los
            turnos ya asignados se conservan, aunque queden fuera de la nueva
            franja.
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha *</FormLabel>
              <FormControl>
                <DatePicker
                  value={
                    field.value ? new Date(`${field.value}T12:00:00`) : undefined
                  }
                  onChange={(date: Date | undefined) => {
                    if (date) {
                      field.onChange(formatDateForCalendar(date));
                      return;
                    }
                    field.onChange("");
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de inicio *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de fin *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="slotDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración del turno</FormLabel>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar duración" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SLOT_DURATIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value.toString()}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel ??
              (isEditing ? "Guardar excepción" : "Crear excepción")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DoctorScheduleExceptionForm;
