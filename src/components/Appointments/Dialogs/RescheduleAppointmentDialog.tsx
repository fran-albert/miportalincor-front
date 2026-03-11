import { useState, useEffect, useMemo } from "react";
import { addDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Clock, User, Stethoscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimeSlotSelect } from "../Select/TimeSlotSelect";
import { formatTimeAR } from "@/common/helpers/timezone";
import { RescheduleAppointmentDto } from "@/types/Appointment/Appointment";
import { Input } from "@/components/ui/input";
import { useAvailableSlotsRange } from "@/hooks/Appointments";

interface RescheduleAppointmentInfo {
  type?: "appointment" | "overturn";
  id: number;
  doctorId: number;
  date: string;
  hour: string;
  consultationTypeId?: number | null;
  doctor?: { firstName: string; lastName: string } | null;
  patient?: { firstName: string; lastName: string } | null;
}

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: RescheduleAppointmentInfo | null;
  onReschedule: (id: number, dto: RescheduleAppointmentDto) => Promise<void>;
  isRescheduling: boolean;
}

export function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onReschedule,
  isRescheduling,
}: RescheduleAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const currentAppointment =
    appointment ??
    ({
      type: "appointment",
      id: 0,
      doctorId: 0,
      date: "",
      hour: "",
      consultationTypeId: undefined,
      doctor: null,
      patient: null,
    } satisfies RescheduleAppointmentInfo);

  useEffect(() => {
    if (!open) {
      setSelectedDate(undefined);
      setSelectedHour("");
    }
  }, [open]);

  const itemType = currentAppointment.type ?? "appointment";
  const useAvailabilityDrivenDates = itemType === "appointment";
  const availabilityRangeStart = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + 1);
    return base;
  }, []);
  const availabilityRangeEnd = useMemo(
    () => addDays(availabilityRangeStart, 90),
    [availabilityRangeStart]
  );
  const { slots: rangeSlots, isLoading: isLoadingAvailabilityRange } = useAvailableSlotsRange({
    doctorId: currentAppointment.doctorId,
    startDate: availabilityRangeStart,
    endDate: availabilityRangeEnd,
    enabled: open && !!appointment && useAvailabilityDrivenDates,
  });
  const availableDates = useMemo(
    () => Array.from(new Set(rangeSlots.map((slot) => slot.date))).sort(),
    [rangeSlots]
  );
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const suggestedDates = useMemo(() => availableDates.slice(0, 5), [availableDates]);

  const dateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;

  const currentHourNormalized = currentAppointment.hour.slice(0, 5);
  const hasChanges =
    dateStr !== undefined &&
    selectedHour !== "" &&
    (dateStr !== currentAppointment.date ||
      selectedHour.slice(0, 5) !== currentHourNormalized);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const handleReschedule = async () => {
    if (!appointment || !dateStr || !selectedHour) return;
    await onReschedule(currentAppointment.id, { date: dateStr, hour: selectedHour });
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {itemType === "overturn" ? "Reprogramar Sobreturno" : "Reprogramar Turno"}
          </DialogTitle>
          <DialogDescription>
            Seleccioná una nueva fecha y horario para este {itemType === "overturn" ? "sobreturno" : "turno"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info actual read-only */}
          <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
            {appointment.doctor && (
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span>
                  Dr/a. {appointment.doctor.firstName}{" "}
                  {appointment.doctor.lastName}
                </span>
              </div>
            )}
            {appointment.patient && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {appointment.patient.firstName}{" "}
                  {appointment.patient.lastName}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(
                  new Date(appointment.date + "T12:00:00"),
                  "EEEE d 'de' MMMM, yyyy",
                  { locale: es }
                )}{" "}
                - {formatTimeAR(appointment.hour)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Nueva fecha */}
          <div className="space-y-2">
            <Label>Nueva fecha</Label>
            {useAvailabilityDrivenDates && suggestedDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedDates.map((date) => (
                  <Button
                    key={date}
                    type="button"
                    size="sm"
                    variant={dateStr === date ? "default" : "outline"}
                    className="h-8 rounded-full"
                    onClick={() => {
                      setSelectedDate(parseISO(`${date}T12:00:00`));
                      setSelectedHour("");
                    }}
                  >
                    {format(parseISO(`${date}T12:00:00`), "EEE d/MM", { locale: es })}
                  </Button>
                ))}
              </div>
            )}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "EEEE d 'de' MMMM, yyyy", {
                        locale: es,
                      })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedHour("");
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => {
                    const normalized = new Date(date);
                    normalized.setHours(0, 0, 0, 0);
                    const dateKey = format(normalized, "yyyy-MM-dd");
                    if (normalized < tomorrow) return true;
                    if (!useAvailabilityDrivenDates) return false;
                    return !availableDateSet.has(dateKey);
                  }}
                  modifiers={
                    useAvailabilityDrivenDates
                      ? {
                          available: availableDates.map((date) => parseISO(`${date}T12:00:00`)),
                        }
                      : undefined
                  }
                  modifiersClassNames={
                    useAvailabilityDrivenDates
                      ? {
                          available: "bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100",
                        }
                      : undefined
                  }
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {useAvailabilityDrivenDates && (
              <p className="text-xs text-muted-foreground">
                {isLoadingAvailabilityRange
                  ? "Buscando días con disponibilidad real del médico..."
                  : availableDates.length > 0
                    ? "Sólo se muestran fechas con horarios disponibles."
                    : "No encontramos fechas con disponibilidad en los próximos 90 días."}
              </p>
            )}
          </div>

          {/* Nuevo horario */}
          <div className="space-y-2">
            <Label>Nuevo horario</Label>
            {itemType === "overturn" ? (
              <Input
                type="time"
                value={selectedHour}
                onChange={(event) => setSelectedHour(event.target.value)}
                disabled={!selectedDate}
              />
            ) : (
              <TimeSlotSelect
                doctorId={appointment.doctorId}
                date={dateStr}
                consultationTypeId={
                  appointment.consultationTypeId ?? undefined
                }
                value={selectedHour}
                onValueChange={setSelectedHour}
                placeholder="Seleccionar horario"
                disabled={!selectedDate}
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRescheduling}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!hasChanges || isRescheduling}
          >
            {isRescheduling ? "Reprogramando..." : "Reprogramar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
