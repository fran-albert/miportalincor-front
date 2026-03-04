import { useState, useEffect } from "react";
import { format } from "date-fns";
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

interface RescheduleAppointmentInfo {
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

  useEffect(() => {
    if (!open) {
      setSelectedDate(undefined);
      setSelectedHour("");
    }
  }, [open]);

  if (!appointment) return null;

  const dateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;

  const currentHourNormalized = appointment.hour.slice(0, 5);
  const hasChanges =
    dateStr !== undefined &&
    selectedHour !== "" &&
    (dateStr !== appointment.date ||
      selectedHour.slice(0, 5) !== currentHourNormalized);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const handleReschedule = async () => {
    if (!dateStr || !selectedHour) return;
    await onReschedule(appointment.id, { date: dateStr, hour: selectedHour });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Reprogramar Turno
          </DialogTitle>
          <DialogDescription>
            Seleccioná una nueva fecha y horario para este turno
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
                  disabled={(date) => date < tomorrow}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Nuevo horario */}
          <div className="space-y-2">
            <Label>Nuevo horario</Label>
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
