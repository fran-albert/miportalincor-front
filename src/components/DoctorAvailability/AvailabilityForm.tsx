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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  CreateDoctorAvailabilitySchema,
  CreateDoctorAvailabilityFormData
} from "@/validators/DoctorAvailability/doctor-availability.schema";
import {
  RecurrenceType,
  RecurrenceTypeLabels,
  WeekDays,
  WeekDaysLabels,
  CreateDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto,
  DoctorAvailabilityResponseDto,
} from "@/types/DoctorAvailability";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import { Loader2 } from "lucide-react";

interface AvailabilityFormProps {
  doctorId: number;
  onSubmit: (data: CreateDoctorAvailabilityDto | UpdateDoctorAvailabilityDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: DoctorAvailabilityResponseDto;
  submitLabel?: string;
}

const SLOT_DURATIONS = [
  { value: 15, label: "15 minutos" },
  { value: 20, label: "20 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
];

export const AvailabilityForm = ({
  doctorId,
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
  submitLabel,
}: AvailabilityFormProps) => {
  const isEditing = !!initialData;

  const form = useForm<CreateDoctorAvailabilityFormData>({
    resolver: zodResolver(CreateDoctorAvailabilitySchema),
    mode: "onSubmit",
    defaultValues: initialData
      ? {
          doctorId,
          recurrenceType: initialData.recurrenceType,
          daysOfWeek: initialData.daysOfWeek || [],
          specificDate: initialData.specificDate,
          dayOfMonth: initialData.dayOfMonth,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          slotDuration: initialData.slotDuration,
          validFrom: initialData.validFrom,
          validUntil: initialData.validUntil,
        }
      : {
          doctorId,
          recurrenceType: RecurrenceType.WEEKLY,
          daysOfWeek: [],
          startTime: "08:00",
          endTime: "12:00",
          slotDuration: 30,
        },
  });

  const recurrenceType = form.watch("recurrenceType");

  const handleSubmit = async (data: CreateDoctorAvailabilityFormData) => {
    const dto: CreateDoctorAvailabilityDto = {
      doctorId: data.doctorId,
      recurrenceType: data.recurrenceType,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDuration: data.slotDuration,
    };

    if (data.recurrenceType === RecurrenceType.NONE && data.specificDate) {
      dto.specificDate = data.specificDate;
    }
    if (data.recurrenceType === RecurrenceType.WEEKLY && data.daysOfWeek) {
      dto.daysOfWeek = data.daysOfWeek;
    }
    if (data.recurrenceType === RecurrenceType.MONTHLY && data.dayOfMonth) {
      dto.dayOfMonth = data.dayOfMonth;
    }
    if (data.validFrom) {
      dto.validFrom = data.validFrom;
    }
    if (data.validUntil) {
      dto.validUntil = data.validUntil;
    }

    await onSubmit(dto);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="recurrenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Recurrencia *</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(RecurrenceTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha específica (solo para NONE) */}
        {recurrenceType === RecurrenceType.NONE && (
          <FormField
            control={form.control}
            name="specificDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Específica *</FormLabel>
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
        )}

        {/* Días de la semana (solo para WEEKLY) */}
        {recurrenceType === RecurrenceType.WEEKLY && (
          <FormField
            control={form.control}
            name="daysOfWeek"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Días de la Semana *</FormLabel>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(WeekDaysLabels).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${value}`}
                        checked={field.value?.includes(value as WeekDays)}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, value as WeekDays]);
                          } else {
                            field.onChange(currentValue.filter(v => v !== value));
                          }
                        }}
                      />
                      <label
                        htmlFor={`day-${value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                {fieldState.error && (
                  <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Día del mes (solo para MONTHLY) */}
        {recurrenceType === RecurrenceType.MONTHLY && (
          <FormField
            control={form.control}
            name="dayOfMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Día del Mes *</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(val) => field.onChange(parseInt(val))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Horarios */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Inicio *</FormLabel>
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
                <FormLabel>Hora de Fin *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duración del turno */}
        <FormField
          control={form.control}
          name="slotDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración del Turno</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(val) => field.onChange(parseInt(val))}
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

        {/* Validez */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Válido Desde (opcional)</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                    onChange={(date: Date | undefined) => {
                      if (date) {
                        field.onChange(formatDateForCalendar(date));
                      } else {
                        field.onChange(undefined);
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
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Válido Hasta (opcional)</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                    onChange={(date: Date | undefined) => {
                      if (date) {
                        field.onChange(formatDateForCalendar(date));
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel ?? (isEditing ? "Guardar Cambios" : "Guardar Disponibilidad")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AvailabilityForm;
