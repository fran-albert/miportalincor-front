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
import {
  IntegralCheckupLink,
  IntegralCheckupSlot,
  RescheduleAppointmentDto,
} from "@/types/Appointment/Appointment";
import { IntegralCheckupNotice } from "../IntegralCheckupNotice";
import { IntegralCheckupDayPicker } from "../IntegralCheckupDayPicker";
import { Input } from "@/components/ui/input";
import {
  useAvailableSlotsRange,
  useIntegralAvailableDays,
  useStaffIntegralAvailableDays,
} from "@/hooks/Appointments";
import { useToastContext } from "@/hooks/Toast/toast-context";
import useUserRole from "@/hooks/useRoles";
import { integralDaysSource } from "@/common/helpers/integral-days-source";

interface RescheduleAppointmentInfo {
  type?: "appointment" | "overturn";
  id: number;
  doctorId?: number | null;
  date: string;
  hour: string;
  consultationTypeId?: number | null;
  doctor?: { userId?: number | null; firstName: string; lastName: string } | null;
  patient?: { firstName: string; lastName: string } | null;
}

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: RescheduleAppointmentInfo | null;
  onReschedule: (id: number, dto: RescheduleAppointmentDto) => Promise<void>;
  isRescheduling: boolean;
  /** Presente solo si el turno es parte de un control ginecológico integral. */
  integralCheckup?: IntegralCheckupLink | null;
}

export function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onReschedule,
  isRescheduling,
  integralCheckup,
}: RescheduleAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { showError } = useToastContext();
  const currentAppointment =
    appointment ??
    ({
      type: "appointment",
      id: 0,
      doctorId: null,
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
  /**
   * 🔴 Reprogramar un control se parece al ALTA del control, no a mover un
   * turno: hay UNA sola hora por día —la de la grilla— y las dos patas se
   * mueven juntas. Ofrecer los huecos libres de la agenda era invitar a elegir
   * algo que el backend iba a rechazar. Que el turno sea parte de un control
   * lo dice el vínculo que ya viene con él: acá no se cablea ninguna médica.
   */
  const isIntegral = !!integralCheckup;
  const useAvailabilityDrivenDates = itemType === "appointment" && !isIntegral;
  const effectiveDoctorId =
    currentAppointment.doctorId ?? currentAppointment.doctor?.userId ?? 0;
  /**
   * El primer día al que se puede mover un turno: mañana. Es UNO SOLO para
   * los dos caminos —el común y el del control—, porque el problema es el
   * mismo: hoy a las 16:00 no se puede reprogramar para hoy a las 10:20.
   */
  const availabilityRangeStart = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + 1);
    return base;
  }, []);
  const minSelectableDate = useMemo(
    () => format(availabilityRangeStart, "yyyy-MM-dd"),
    [availabilityRangeStart]
  );
  const availabilityRangeEnd = useMemo(
    () => addDays(availabilityRangeStart, 90),
    [availabilityRangeStart]
  );
  const { slots: rangeSlots, isLoading: isLoadingAvailabilityRange } = useAvailableSlotsRange({
    doctorId: effectiveDoctorId,
    startDate: availabilityRangeStart,
    endDate: availabilityRangeEnd,
    enabled: open && !!appointment && useAvailabilityDrivenDates,
  });

  /**
   * El día donde el control ya está lo ocupa el propio control: sin excluirlo
   * del cálculo, el listado esconde justo el día donde está parado quien lo
   * mueve. Se excluye por el turno de la CONSULTA —el que ocupa el casillero
   * de la ginecóloga—, se entre por la pata que se entre.
   */
  const integralConsultationId = integralCheckup
    ? integralCheckup.role === "CONSULTATION"
      ? currentAppointment.id
      : integralCheckup.counterpartId
    : undefined;
  /**
   * 🔴 Cuál de los dos listados se pregunta sale de la CAPACIDAD de quien
   * mira, no de un rol negado: este diálogo vive en las dos pantallas (el
   * turnero y el portal) y hay dos endpoints para cuatro roles. Preguntar
   * "¿no es paciente?" mandaba a la médica al listado de secretaría, que le
   * contesta 403 y le dejaba el listado muerto. Quiénes son "el personal"
   * está escrito en un solo lugar: `integralDaysSource`.
   */
  const roles = useUserRole();
  const daysSource = integralDaysSource(roles);
  const wantsIntegralDays = open && !!appointment && isIntegral;
  const staffIntegralDays = useStaffIntegralAvailableDays({
    enabled: wantsIntegralDays && daysSource === "staff",
    excludeAppointmentId: integralConsultationId,
  });
  const patientIntegralDays = useIntegralAvailableDays({
    enabled: wantsIntegralDays && daysSource === "patient",
    excludeAppointmentId: integralConsultationId,
  });
  const integralDays =
    daysSource === "patient" ? patientIntegralDays : staffIntegralDays;
  /**
   * El backend arma la lista de días del control **desde hoy**: si se mostrara
   * tal cual, un miércoles a las 16:00 se podría mover el control a ese mismo
   * miércoles 10:20. Se recorta con el mismo mínimo del camino común.
   */
  const selectableIntegralDays = useMemo(
    () => integralDays.days.filter((day) => day.date >= minSelectableDate),
    [integralDays.days, minSelectableDate]
  );
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

  /**
   * 🔴 La hora de la pata que se está moviendo, tal como la manda el backend.
   * El front no deriva una de la otra ni sabe cuál va primero: la separación
   * entre la consulta y la eco no es fija (miércoles 20 minutos, jueves 30) y
   * el orden ya se invirtió una vez.
   */
  const integralHourFor = (day: IntegralCheckupSlot): string =>
    integralCheckup?.role === "ULTRASOUND"
      ? day.ultrasoundHour
      : day.consultationHour;

  const handleIntegralDaySelect = (day: IntegralCheckupSlot) => {
    setSelectedDate(parseISO(`${day.date}T12:00:00`));
    setSelectedHour(integralHourFor(day));
  };

  /**
   * 🔴 Lo que el backend rechaza, el usuario lo lee.
   *
   * Sin este `try/catch` la promesa se rechazaba, nadie la atrapaba y la
   * pantalla se quedaba igual: apretar "Reprogramar" no hacía nada. No era un
   * problema del control integral —cualquier rechazo (solapamiento, médico
   * ausente, feriado, estado no reprogramable) se tragaba igual—, y el diálogo
   * tampoco se cierra cuando falla: se queda abierto para poder corregir.
   */
  const handleReschedule = async () => {
    if (!appointment || !dateStr || !selectedHour) return;
    try {
      await onReschedule(currentAppointment.id, { date: dateStr, hour: selectedHour });
      onOpenChange(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      showError(
        "Error",
        axiosError.response?.data?.message || "No se pudo reprogramar el turno",
      );
    }
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
            {isIntegral
              ? "Elegí el nuevo día del control: los horarios los pone la grilla"
              : `Seleccioná una nueva fecha y horario para este ${itemType === "overturn" ? "sobreturno" : "turno"}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {integralCheckup && (
            <IntegralCheckupNotice
              link={integralCheckup}
              action="reschedule"
              compact
            />
          )}

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

          {isIntegral ? (
            /* El control no ofrece horas sueltas: se elige el DÍA y cada día
               muestra las dos horas, igual que en el alta. */
            <div className="space-y-2">
              <Label>Nuevo día</Label>
              <IntegralCheckupDayPicker
                days={selectableIntegralDays}
                isLoading={integralDays.isLoading}
                isError={integralDays.isError}
                selectedDate={dateStr ?? null}
                onSelect={handleIntegralDaySelect}
                currentDate={currentAppointment.date}
                onRetry={() => void integralDays.refetch()}
              />
            </div>
          ) : (
            <>
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
                      if (normalized < availabilityRangeStart) return true;
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
                  doctorId={effectiveDoctorId}
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
            </>
          )}
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
